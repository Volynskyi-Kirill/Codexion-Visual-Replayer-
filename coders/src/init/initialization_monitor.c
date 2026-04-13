/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   initialization_monitor.c                           :+:    :+:            */
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

int	start_monitor(t_data *data)
{
	int	status;

	status = pthread_create(&data->monitor, NULL, monitor_routine,
			(void *)data);
	if (status != 0)
	{
		fprintf(stderr, "Error create: %s\n", strerror(status));
		return (1);
	}
	return (0);
}
