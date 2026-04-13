/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   heap_priority.c                                    :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/04/11 17:30:00 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"
#include <stdio.h>

/**
 * @brief Checks if a node should bubble up in the min-heap.
 *
 * A node bubbles up if it has a lower priority than its parent.
 *
 * @param heap The heap structure.
 * @param i Index of the current node.
 * @return 1 if the node should bubble up, 0 otherwise.
 */
int	should_bubble_up(t_heap *heap, int i)
{
	if (i == 0)
		return (0);
	return (heap->array[get_parent(i)].priority > heap->array[i].priority);
}

/**
 * @brief Bubbles a node up from the given index.
 *
 * @param heap The heap structure.
 * @param i Index from which to start bubbling up.
 */
void	bubble_up_from(t_heap *heap, int i)
{
	while (should_bubble_up(heap, i))
	{
		swap_heap(&heap->array[i], &heap->array[get_parent(i)]);
		i = get_parent(i);
	}
}

/**
 * @brief Returns the priority value for the current scheduler.
 *
 * Uses request time for FIFO and deadline time for EDF.
 *
 * @param coder Current coder.
 * @return Priority value used by the heap.
 */
long long	get_node_priority(t_coder *coder)
{
	if (coder->data->scheduler == CODERS_SCHED_FIFO)
		return (get_current_time());
	if (coder->data->scheduler == CODERS_SCHED_EDF)
		return (coder->last_compiling_at + coder->data->time_to_burnout);
	printf("uknown scheduler!");
	return (0);
}
