/**
 * Admin Security Service
 * Handles admin-only security operations (incidents, audit logs, blocked IPs)
 * ONLY accessible by SUPERADMIN role
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SecurityIncident {
    id: string;
    type: 'BREACH_ATTEMPT' | 'SUSPICIOUS_IP' | 'BRUTE_FORCE' | 'ACCOUNT_TAKEOVER' |
    'DATA_EXFILTRATION' | 'UNAUTHORIZED_ACCESS' | 'MALWARE' | 'OTHER';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED' | 'RESOLVED' | 'FALSE_POSITIVE';
    title: string;
    description: string;
    affectedUsers: string[]; // User IDs
    ipAddress?: string;
    location?: string;
    detectedAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
    mitigation?: string;
    metadata?: Record<string, unknown>;
}

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    resource: string;
    ipAddress: string;
    location?: string;
    userAgent: string;
    success: boolean;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
}

export interface SuspiciousIP {
    id: string;
    ipAddress: string;
    location?: string;
    reason: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    blockedAt: string;
    blockedBy: string;
    blockedUntil?: string;
    attackCount: number;
    lastAttackAt: string;
    permanent: boolean;
}

export interface ComplianceReport {
    generatedAt: string;
    dateRange: {
        from: string;
        to: string;
    };
    totalUsers: number;
    activeUsers: number;
    twoFactorEnabled: number;
    securityIncidents: {
        total: number;
        bySevert: Record<string, number>;
        resolved: number;
    };
    auditLogs: {
        total: number;
        successRate: number;
    };
    blockedIPs: number;
}

// Response types
export interface IncidentsResponse {
    status: string;
    data: {
        incidents: SecurityIncident[];
        total: number;
    };
}

export interface IncidentDetailResponse {
    status: string;
    data: SecurityIncident;
}

export interface AuditLogsResponse {
    status: string;
    data: {
        logs: AuditLog[];
        total: number;
    };
}

export interface SuspiciousIPsResponse {
    status: string;
    data: {
        ips: SuspiciousIP[];
        total: number;
    };
}

export interface ComplianceReportResponse {
    status: string;
    data: ComplianceReport;
}

// ============================================================================
// ADMIN SECURITY SERVICE CLASS
// ============================================================================

class AdminSecurityService {
    /**
     * Get security incidents list
     * @param accessToken - Admin access token
     * @param filters - Optional filters (status, severity, limit)
     */
    async getIncidents(
        filters?: {
            status?: string;
            severity?: string;
            limit?: number;
        }
    ): Promise<IncidentsResponse> {
        try {
            const response = await axios.get<IncidentsResponse>(
                `${API_URL}/admin/security/incidents`,
                {
                    withCredentials: true,
                    params: filters,
                    timeout: 15000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to fetch security incidents'
                );
            }
            throw error;
        }
    }

    /**
     * Get incident details
     * @param incidentId - Incident ID
     * @param accessToken - Admin access token
     */
    async getIncidentDetail(
        incidentId: string,
        accessToken: string
    ): Promise<IncidentDetailResponse> {
        try {
            const response = await axios.get<IncidentDetailResponse>(
                `${API_URL}/admin/security/incidents/${incidentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to fetch incident details'
                );
            }
            throw error;
        }
    }

    /**
     * Mitigate incident
     * @param incidentId - Incident ID
     * @param mitigation - Mitigation notes
     * @param accessToken - Admin access token
     */
    async mitigateIncident(
        incidentId: string,
        mitigation: string
    ): Promise<{ status: string; message: string }> {
        try {
            const response = await axios.post(
                `${API_URL}/admin/security/incidents/${incidentId}/mitigate`,
                { mitigation },
                {
                    withCredentials: true,
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to mitigate incident'
                );
            }
            throw error;
        }
    }

    /**
     * Resolve incident
     * @param incidentId - Incident ID
     * @param resolution - Resolution notes
     * @param accessToken - Admin access token
     */
    async resolveIncident(
        incidentId: string,
        resolution: string
    ): Promise<{ status: string; message: string }> {
        try {
            const response = await axios.post(
                `${API_URL}/admin/security/incidents/${incidentId}/resolve`,
                { resolution },
                {
                    withCredentials: true,
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to resolve incident'
                );
            }
            throw error;
        }
    }

    /**
     * Get audit logs
     * @param accessToken - Admin access token
     * @param filters - Optional filters
     */
    async getAuditLogs(
        filters?: {
            userId?: string;
            action?: string;
            success?: boolean;
            from?: string;
            to?: string;
            limit?: number;
        }
    ): Promise<AuditLogsResponse> {
        try {
            const response = await axios.get<AuditLogsResponse>(
                `${API_URL}/admin/security/audit-logs`,
                {
                    withCredentials: true,
                    params: filters,
                    timeout: 15000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to fetch audit logs'
                );
            }
            throw error;
        }
    }

    /**
     * Export audit logs as CSV
     * @param accessToken - Admin access token
     * @param filters - Optional filters
     */
    async exportAuditLogs(
        filters?: {
            from?: string;
            to?: string;
        }
    ): Promise<Blob> {
        try {
            const response = await axios.get(
                `${API_URL}/admin/security/audit-logs/export`,
                {
                    withCredentials: true,
                    params: filters,
                    responseType: 'blob',
                    timeout: 30000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error('Failed to export audit logs');
            }
            throw error;
        }
    }

    /**
     * Get suspicious/blocked IPs
     * @param accessToken - Admin access token
     */
    async getSuspiciousIPs(): Promise<SuspiciousIPsResponse> {
        try {
            const response = await axios.get<SuspiciousIPsResponse>(
                `${API_URL}/admin/security/suspicious-ips`,
                {
                    withCredentials: true,
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to fetch suspicious IPs'
                );
            }
            throw error;
        }
    }

    /**
     * Unblock IP address
     * @param ipAddress - IP to unblock
     * @param accessToken - Admin access token
     */
    async unblockIP(
        ipAddress: string): Promise<{ status: string; message: string }> {
        try {
            const response = await axios.delete(
                `${API_URL}/admin/security/suspicious-ips/${ipAddress}`,
                {
                    withCredentials: true,
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to unblock IP'
                );
            }
            throw error;
        }
    }

    /**
     * Generate compliance report
     * @param accessToken - Admin access token
     * @param dateRange - Optional date range
     */
    async getComplianceReport(
        accessToken: string,
        dateRange?: {
            from: string;
            to: string;
        }
    ): Promise<ComplianceReportResponse> {
        try {
            const response = await axios.get<ComplianceReportResponse>(
                `${API_URL}/admin/security/compliance-report`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    params: dateRange,
                    timeout: 15000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to generate compliance report'
                );
            }
            throw error;
        }
    }
}

// Export singleton instance
export const adminSecurityService = new AdminSecurityService();
export default AdminSecurityService;
