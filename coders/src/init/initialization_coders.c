/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   initialization_coders.c                            :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/04/11 17:30:00 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void	cleanup_coders_range(t_data *data, int count, int destroy_mutexes)
{
	int	i;

	if (!data || !data->coders)
		return ;
	i = 0;
	while (i < count)
	{
		if (destroy_mutexes)
			pthread_mutex_destroy(&data->coders[i].mutex);
		i++;
	}
	free(data->coders);
	data->coders = NULL;
}

int	init_coders(t_data *data)
{
	int		i;
	t_coder	*coder;

	data->coders = malloc(sizeof(t_coder) * data->number_of_coders);
	if (!data->coders)
		return (1);
	i = 0;
	while (i < data->number_of_coders)
	{
		coder = &data->coders[i];
		coder->id = i + 1;
		coder->status = CODER_INITIALIZING;
		coder->data = data;
		coder->last_compiling_at = data->start_time;
		coder->compiles_done = 0;
		i++;
	}
	return (0);
}

int	init_coder_mutexes(t_data *data)
{
	int	status;
	int	i;

	i = 0;
	while (i < data->number_of_coders)
	{
		status = pthread_mutex_init(&data->coders[i].mutex, NULL);
		if (status != 0)
		{
			cleanup_coders_range(data, i, 1);
			fprintf(stderr, "Error mutex init coder_mutex: %s\n",
				strerror(status));
			return (1);
		}
		i++;
	}
	return (0);
}

int	start_coders(t_data *data)
{
	int	i;
	int	status;

	i = 0;
	while (i < data->number_of_coders)
	{
		status = pthread_create(&data->coders[i].thread, NULL, coder_routine,
				(void *)&data->coders[i]);
		if (status != 0)
		{
			fprintf(stderr, "Error create: %s\n", strerror(status));
			return (1);
		}
		i++;
	}
	return (0);
}

int	join_coders(t_data *data)
{
	int	i;
	int	status;

	i = 0;
	while (i < data->number_of_coders)
	{
		status = pthread_join(data->coders[i].thread, NULL);
		if (status != 0)
		{
			fprintf(stderr, "Error join: %s\n", strerror(status));
			return (1);
		}
		i++;
	}
	return (0);
}
