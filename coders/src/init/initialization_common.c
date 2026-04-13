/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   initialization_common.c                            :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/04/11 17:30:00 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"
#include <stdio.h>
#include <string.h>

int	init_start_time(t_data *data)
{
	long long	time;

	time = get_current_time();
	if (!time)
		return (1);
	data->start_time = time;
	return (0);
}

int	init_data_mutexes(t_data *data)
{
	int	status;

	status = pthread_mutex_init(&data->stop_mutex, NULL);
	if (status != 0)
	{
		fprintf(stderr, "Error mutex init stop_mutex: %s\n", strerror(status));
		return (1);
	}
	status = pthread_mutex_init(&data->print_mutex, NULL);
	if (status != 0)
	{
		fprintf(stderr, "Error mutex init print_mutex: %s\n", strerror(status));
		pthread_mutex_destroy(&data->stop_mutex);
		return (1);
	}
	return (0);
}

void	wake_all_dongle_waiters(t_data *data)
{
	int	i;

	i = 0;
	while (i < data->number_of_coders)
	{
		pthread_mutex_lock(&data->dongles[i].mutex);
		pthread_cond_broadcast(&data->dongles[i].cond);
		pthread_mutex_unlock(&data->dongles[i].mutex);
		i++;
	}
}
