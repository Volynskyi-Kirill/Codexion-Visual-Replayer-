/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   initialization_dongles.c                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/04/10 21:46:29 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/10 21:50:59 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void	cleanup_dongles_range(t_data *data, int count, int destroy_mutexes,
		int destroy_conds)
{
	int	i;

	if (!data || !data->dongles)
		return ;
	i = 0;
	while (i < count)
	{
		if (destroy_mutexes)
			pthread_mutex_destroy(&data->dongles[i].mutex);
		if (destroy_conds)
			pthread_cond_destroy(&data->dongles[i].cond);
		free(data->dongles[i].queue->array);
		free(data->dongles[i].queue);
		i++;
	}
	free(data->dongles);
	data->dongles = NULL;
}

int	init_dongles(t_data *data)
{
	int			i;
	t_dongle	*dongle;

	data->dongles = malloc(sizeof(t_dongle) * data->number_of_coders);
	if (!data->dongles)
		return (1);
	i = 0;
	while (i < data->number_of_coders)
	{
		dongle = &data->dongles[i];
		dongle->id = i + 1;
		dongle->status = DONGLE_FREE;
		dongle->last_released_at = 0;
		dongle->queue = create_heap(2);
		if (!dongle->queue)
		{
			cleanup_dongles_range(data, i, 0, 0);
			return (1);
		}
		i++;
	}
	return (0);
}

int	init_dongle_mutexes(t_data *data)
{
	int	status;
	int	i;

	i = 0;
	while (i < data->number_of_coders)
	{
		status = pthread_mutex_init(&data->dongles[i].mutex, NULL);
		if (status != 0)
		{
			cleanup_dongles_range(data, i, 1, 0);
			fprintf(stderr, "Error mutex init dongle_mutex: %s\n",
				strerror(status));
			return (1);
		}
		i++;
	}
	return (0);
}

int	init_dongle_conds(t_data *data)
{
	int	status;
	int	i;

	i = 0;
	while (i < data->number_of_coders)
	{
		status = pthread_cond_init(&data->dongles[i].cond, NULL);
		if (status != 0)
		{
			cleanup_dongles_range(data, i, 1, 1);
			fprintf(stderr, "Error cond init dongle_cond: %s\n",
				strerror(status));
			return (1);
		}
		i++;
	}
	return (0);
}
