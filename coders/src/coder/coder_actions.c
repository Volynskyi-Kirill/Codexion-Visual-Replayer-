/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   coder_actions.c                                    :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/04/11 17:30:00 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"

static void	take_dongle(t_coder *coder, int idx);
static void	release_dongle(t_coder *coder, int idx);
static int	wait_for_dongle(t_dongle *dongle, t_coder *coder);
static int	can_take_dongle(t_dongle *dongle, t_coder *coder);

/**
 * @brief Performs one full compile cycle for a coder.
 *
 * Locks both required dongles in deterministic order, compiles,
 * then releases both dongles.
 *
 * @param coder Current coder.
 */
void	coder_compile(t_coder *coder)
{
	int	first;
	int	second;

	get_dongle_lock_order(coder, &first, &second);
	take_dongle(coder, first);
	take_dongle(coder, second);
	update_compiling_at(coder);
	print_status(coder, "is compiling");
	log_json(coder->data, "START_COMPILE", coder, NULL);
	ft_sleep(coder->data->time_to_compile);
	release_dongle(coder, first);
	release_dongle(coder, second);
}

/**
 * @brief Requests and acquires one dongle using scheduler priority.
 *
 * Pushes the coder into the dongle wait-queue and waits on the condition
 * variable until this coder can take the dongle.
 *
 * @param coder Current coder.
 * @param idx Dongle index to take.
 */
static void	take_dongle(t_coder *coder, int idx)
{
	t_dongle	*dongle;
	t_node		node;

	dongle = &coder->data->dongles[idx];
	node.coder_id = coder->id;
	node.priority = get_node_priority(coder);
	pthread_mutex_lock(&dongle->mutex);
	insert_heap(dongle->queue, node);
	log_json(coder->data, "REQUEST_DONGLE", coder, dongle);
	if (wait_for_dongle(dongle, coder))
	{
		pthread_mutex_unlock(&dongle->mutex);
		return ;
	}
	pop_heap(dongle->queue);
	dongle->status = DONGLE_OCCUPIED;
	print_status(coder, "has taken a dongle");
	log_json(coder->data, "TAKE_DONGLE", coder, dongle);
	pthread_mutex_unlock(&dongle->mutex);
}

static int	wait_for_dongle(t_dongle *dongle, t_coder *coder)
{
	struct timespec	ts;

	while (!can_take_dongle(dongle, coder))
	{
		if (get_is_simulation_end(coder->data))
		{
			pop_node_by_id(dongle->queue, coder->id);
			return (1);
		}
		if (dongle->status == DONGLE_FREE
			&& dongle->queue->array[0].coder_id == coder->id)
		{
			prepare_dongle_wait_time(dongle, coder->data, &ts);
			pthread_cond_timedwait(&dongle->cond, &dongle->mutex, &ts);
		}
		else
			pthread_cond_wait(&dongle->cond, &dongle->mutex);
	}
	return (0);
}

/**
 * @brief Releases one dongle and wakes waiting coders.
 *
 * Marks the dongle as free, updates release time, and broadcasts the
 * condition variable so queued coders can re-check acquisition conditions.
 *
 * @param coder Current coder.
 * @param idx Dongle index to release.
 */
static void	release_dongle(t_coder *coder, int idx)
{
	t_dongle	*dongle;

	dongle = &coder->data->dongles[idx];
	pthread_mutex_lock(&dongle->mutex);
	dongle->status = DONGLE_FREE;
	dongle->last_released_at = get_current_time();
	log_json(coder->data, "RELEASE_DONGLE", coder, dongle);
	pthread_cond_broadcast(&dongle->cond);
	pthread_mutex_unlock(&dongle->mutex);
}

/**
 * @brief Checks whether the coder may acquire this dongle now.
 *
 * Requires a free dongle, cooldown elapsed, and this coder at queue head.
 *
 * @param dongle Target dongle.
 * @param coder Current coder.
 * @return 1 if the coder can take the dongle, otherwise 0.
 */
static int	can_take_dongle(t_dongle *dongle, t_coder *coder)
{
	long	elapsed;

	elapsed = get_current_time() - dongle->last_released_at;
	return (dongle->status == DONGLE_FREE
		&& elapsed > coder->data->dongle_cooldown
		&& dongle->queue->array[0].coder_id == coder->id);
}
