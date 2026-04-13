/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   coder_utils.c                                      :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/04/11 17:30:00 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"

/**
 * @brief Builds the absolute wake-up time for a dongle cooldown wait.
 *
 * @param dongle Dongle being checked.
 * @param data Shared simulation data.
 * @param ts Output timespec for timed waiting.
 */
void	prepare_dongle_wait_time(t_dongle *dongle, t_data *data,
		struct timespec *ts)
{
	long long	wait_until_ms;

	wait_until_ms = dongle->last_released_at + data->dongle_cooldown + 1;
	ts->tv_sec = wait_until_ms / 1000;
	ts->tv_nsec = (wait_until_ms % 1000) * 1000000;
}
