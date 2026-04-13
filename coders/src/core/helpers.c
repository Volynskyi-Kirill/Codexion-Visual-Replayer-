/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   helpers.c                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/03/24 20:16:36 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"
#include <limits.h>
#include <sys/time.h>
#include <string.h>

int	ft_isdigit(int c)
{
	if (c >= '0' && c <= '9')
	{
		return (1);
	}
	return (0);
}

int	ft_isdigitstr(char *s)
{
	int	i;

	i = 0;
	while (s[i])
	{
		if (!ft_isdigit(s[i]))
			return (0);
		i++;
	}
	return (1);
}

long long	ft_atoll(const char *str)
{
	long long	res;
	int			digit;

	res = 0;
	while (*str >= '0' && *str <= '9')
	{
		digit = *str - '0';
		if (res > (LLONG_MAX - digit) / 10)
			return (-1);
		res = res * 10 + digit;
		str++;
	}
	return (res);
}

long long	get_current_time(void)
{
	struct timeval	tv;

	if (gettimeofday(&tv, NULL) == -1)
		return (0);
	return ((long long)tv.tv_sec * 1000 + tv.tv_usec / 1000);
}

static void	print_heap_json(t_data *data, t_heap *heap)
{
	int	i;

	if (!data->log_file)
		return ;
	fprintf(data->log_file, ", \"queue\": [");
	i = 0;
	while (i < heap->size)
	{
		fprintf(data->log_file, "%d%s", heap->array[i].coder_id,
			(i == heap->size - 1) ? "" : ",");
		i++;
	}
	fprintf(data->log_file, "], \"priorities\": [");
	i = 0;
	while (i < heap->size)
	{
		fprintf(data->log_file, "%lld%s", heap->array[i].priority
			- data->start_time, (i == heap->size - 1) ? "" : ",");
		i++;
	}
	fprintf(data->log_file, "]");
}

void	log_json(t_data *data, const char *status, t_coder *coder,
			t_dongle *dongle)
{
	pthread_mutex_lock(&data->print_mutex);
	if (data->log_file && (!get_is_simulation_end(data) || !strcmp(status,
				"BURNOUT") || !strcmp(status, "SUCCESS")))
	{
		fprintf(data->log_file, "{\"ts\": %lld, \"status\": \"%s\"",
			get_timestamp(data->start_time), status);
		if (coder)
		{
			fprintf(data->log_file, ", \"coder_id\": %d", coder->id);
			if (!strncmp(status, "START_", 6))
			{
				fprintf(data->log_file, ", \"details\": "
					"{\"compiles_done\": %d, \"deadline\": %lld}",
					coder->compiles_done, coder->last_compiling_at
					+ data->time_to_burnout - data->start_time);
			}
		}
		if (dongle)
		{
			fprintf(data->log_file, ", \"dongle_id\": %d", dongle->id);
			print_heap_json(data, dongle->queue);
		}
		fprintf(data->log_file, "}\n");
		fflush(data->log_file);
	}
	pthread_mutex_unlock(&data->print_mutex);
}
