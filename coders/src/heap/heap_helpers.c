/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   heap_helpers.c                                     :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/03/31 21:01:46 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"

/**
 * @brief Returns the index of the left child in the heap array.
 *
 * @param i Current node index.
 * @return Left child index.
 */
int	get_left_child(int i)
{
	return (2 * i + 1);
}

/**
 * @brief Returns the index of the right child in the heap array.
 *
 * @param i Current node index.
 * @return Right child index.
 */
int	get_right_child(int i)
{
	return (2 * i + 2);
}

/**
 * @brief Returns the index of the parent node in the heap array.
 *
 * @param i Current node index.
 * @return Parent index.
 */
int	get_parent(int i)
{
	return ((i - 1) / 2);
}

/**
 * @brief Removes a node from the heap by coder ID.
 *
 * Finds the node with the given coder_id and removes it from the heap,
 * restoring heap order by moving the last element to the removed node's
 * position and re-heapifying as needed.
 *
 * @param heap The heap to remove from.
 * @param coder_id The ID of the coder to remove.
 * @return 1 if node was found and removed, 0 otherwise.
 */
int	pop_node_by_id(t_heap *heap, int coder_id)
{
	int	i;

	i = 0;
	while (i < heap->size)
	{
		if (heap->array[i].coder_id == coder_id)
		{
			heap->array[i] = heap->array[heap->size - 1];
			heap->size--;
			if (i < heap->size && should_bubble_up(heap, i))
				bubble_up_from(heap, i);
			else if (i < heap->size)
				heapify(heap, i);
			return (1);
		}
		i++;
	}
	return (0);
}
