package com.dibafbc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalPlayers;
    private long totalMatches;
    private String attendancePercentage;
    private String pendingPayments;
    
    // Recent activity structure if needed
}
