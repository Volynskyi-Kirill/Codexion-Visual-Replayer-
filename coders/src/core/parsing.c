/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   parsing.c                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/03/24 20:16:32 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int			parse_int(char *value, int *out);
int			parse_long_long(char *value, long long *out);

static int	parse_numeric_arguments(t_data *data, char *argv[])
{
	if (parse_int(argv[1], &data->number_of_coders) != 0)
		return (1);
	if (parse_long_long(argv[2], &data->time_to_burnout) != 0)
		return (1);
	if (parse_long_long(argv[3], &data->time_to_compile) != 0)
		return (1);
	if (parse_long_long(argv[4], &data->time_to_debug) != 0)
		return (1);
	if (parse_long_long(argv[5], &data->time_to_refactor) != 0)
		return (1);
	if (parse_int(argv[6], &data->number_of_compiles_required) != 0)
		return (1);
	if (parse_long_long(argv[7], &data->dongle_cooldown) != 0)
		return (1);
	if (data->time_to_burnout <= 0 || data->time_to_compile <= 0
		|| data->time_to_debug <= 0 || data->time_to_refactor <= 0)
	{
		printf("ERROR: enter positive value!\n");
		return (1);
	}
	return (0);
}

int	parse(t_data *data, int argc, char *argv[])
{
	if (argc != 9)
	{
		printf("ERROR: enter all arguments!\n");
		return (1);
	}
	if (parse_numeric_arguments(data, argv) != 0)
		return (1);
	if (strcmp(argv[8], "fifo") == 0)
		data->scheduler = CODERS_SCHED_FIFO;
	else if (strcmp(argv[8], "edf") == 0)
		data->scheduler = CODERS_SCHED_EDF;
	else
	{
		printf("Error: Invalid scheduler. Use 'fifo' or 'edf'.\n");
		return (1);
	}
	data->is_simulation_end = 0;
	return (0);
}

int	parse_long_long(char *value, long long *out)
{
	long long	time;

	if (!ft_isdigitstr(value))
	{
		printf("ERROR: enter only digits!\n");
		return (1);
	}
	time = ft_atoll(value);
	if (time < 0)
	{
		printf("ERROR: value out of range!\n");
		return (1);
	}
	*out = time;
	return (0);
}

int	parse_int(char *value, int *out)
{
	long long	num;

	if (!ft_isdigitstr(value))
	{
		printf("ERROR: enter only digits!\n");
		return (1);
	}
	num = ft_atoll(value);
	if (num < 0 || num > INT_MAX)
	{
		printf("ERROR: value out of range!\n");
		return (1);
	}
	if (num <= 0)
	{
		printf("ERROR: enter positive value!\n");
		return (1);
	}
	*out = (int)num;
	return (0);
}
