/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   launch_routines.c                                  :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/04/11 17:30:00 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"
#include <pthread.h>
#include <stdio.h>
#include <string.h>

static int	handle_monitor_error(t_data *data)
{
	stop_simulation(data);
	wake_all_dongle_waiters(data);
	if (join_coders(data) != 0)
		printf("Error: join_coders failed after monitor start error\n");
	return (1);
}

static int	handle_join_error(t_data *data)
{
	int	status;

	stop_simulation(data);
	wake_all_dongle_waiters(data);
	status = pthread_join(data->monitor, NULL);
	if (status != 0)
		fprintf(stderr, "Error join monitor: %s\n", strerror(status));
	return (1);
}

static int	join_monitor(t_data *data)
{
	int	status;

	status = pthread_join(data->monitor, NULL);
	if (status != 0)
	{
		fprintf(stderr, "Error join monitor: %s\n", strerror(status));
		return (1);
	}
	return (0);
}

int	launch_simulation(t_data *data)
{
	if (start_coders(data) != 0)
	{
		printf("Error: start_coders failed\n");
		return (1);
	}
	if (start_monitor(data) != 0)
	{
		printf("Error: start_monitor failed\n");
		return (handle_monitor_error(data));
	}
	if (join_coders(data) != 0)
	{
		printf("Error: join_coders failed\n");
		return (handle_join_error(data));
	}
	return (join_monitor(data));
}
