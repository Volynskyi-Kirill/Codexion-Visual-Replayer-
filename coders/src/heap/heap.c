/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   heap.c                                             :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/03/31 19:20:07 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"
#include <stdio.h>
#include <stdlib.h>

/**
 * @brief Creates an empty min-heap with fixed capacity.
 *
 * Allocates the heap structure and its backing array.
 *
 * @param capacity Maximum number of nodes the heap can hold.
 * @return Pointer to the created heap, or NULL on allocation failure.
 */
t_heap	*create_heap(int capacity)
{
	t_heap	*heap;

	heap = (t_heap *)malloc(sizeof(t_heap));
	if (!heap)
		return (NULL);
	heap->size = 0;
	heap->capacity = capacity;
	heap->array = (t_node *)malloc(capacity * sizeof(t_node));
	if (!heap->array)
	{
		free(heap);
		return (NULL);
	}
	return (heap);
}

/**
 * @brief Swaps two heap nodes in place.
 *
 * @param a First node.
 * @param b Second node.
 */
void	swap_heap(t_node *a, t_node *b)
{
	t_node	tmp;

	tmp = *a;
	*a = *b;
	*b = tmp;
}

/**
 * @brief Inserts one node into the min-heap.
 *
 * Places the node at the end and bubbles it up to restore heap order.
 *
 * @param heap Heap to modify.
 * @param node Node to insert.
 */
void	insert_heap(t_heap *heap, t_node node)
{
	int	i;

	if (heap->size == heap->capacity)
	{
		printf("ERROR: heap overflow!\n");
		return ;
	}
	i = heap->size;
	heap->size++;
	heap->array[i] = node;
	bubble_up_from(heap, i);
}

/**
 * @brief Restores min-heap order from a given index downward.
 *
 * @param heap Heap to modify.
 * @param i Root index of the subtree to heapify.
 */
void	heapify(t_heap *heap, int i)
{
	int	smallest;
	int	left;
	int	right;

	smallest = i;
	left = get_left_child(i);
	right = get_right_child(i);
	if (left < heap->size
		&& heap->array[left].priority < heap->array[smallest].priority)
		smallest = left;
	if (right < heap->size
		&& heap->array[right].priority < heap->array[smallest].priority)
		smallest = right;
	if (smallest != i)
	{
		swap_heap(&heap->array[i], &heap->array[smallest]);
		heapify(heap, smallest);
	}
}

/**
 * @brief Removes and returns the minimum-priority node from the heap.
 *
 * Returns a sentinel node with priority -1 when the heap is empty.
 *
 * @param heap Heap to pop from.
 * @return The removed head node, or {0, -1} if heap is empty.
 */
t_node	pop_heap(t_heap *heap)
{
	t_node	head;

	if (heap->size <= 0)
		return ((t_node){0, -1});
	head = heap->array[0];
	heap->array[0] = heap->array[heap->size - 1];
	heap->size--;
	heapify(heap, 0);
	return (head);
}
