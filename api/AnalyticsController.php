<?php
require_once __DIR__ . '/config.php';

class AnalyticsController {
    public function dashboard() {
        requireAuth();
        $db = getDB();
        
        // Total properties
        $stmt = $db->query("SELECT COUNT(*) as total FROM properties");
        $totalProperties = $stmt->fetch()['total'];
        
        // Active properties (for sale/rent)
        $stmt = $db->query("SELECT COUNT(*) as total FROM properties WHERE status IN ('for_sale', 'for_rent')");
        $activeProperties = $stmt->fetch()['total'];
        
        // Sold properties
        $stmt = $db->query("SELECT COUNT(*) as total FROM properties WHERE status = 'sold'");
        $soldProperties = $stmt->fetch()['total'];
        
        // Total leads
        $stmt = $db->query("SELECT COUNT(*) as total FROM leads");
        $totalLeads = $stmt->fetch()['total'];
        
        // New leads this month
        $stmt = $db->query("SELECT COUNT(*) as count FROM leads WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
        $newLeadsThisMonth = $stmt->fetch()['count'];
        
        // Total property value (active)
        $stmt = $db->query("SELECT SUM(price) as total FROM properties WHERE status IN ('for_sale', 'for_rent', 'pending')");
        $totalValue = $stmt->fetch()['total'] ?? 0;
        
        // Average property price
        $stmt = $db->query("SELECT AVG(price) as avg FROM properties WHERE status IN ('for_sale', 'for_rent')");
        $avgPrice = $stmt->fetch()['avg'] ?? 0;
        
        // Properties by type
        $stmt = $db->query("SELECT property_type, COUNT(*) as count FROM properties GROUP BY property_type");
        $byType = $stmt->fetchAll();
        
        // Properties by status
        $stmt = $db->query("SELECT status, COUNT(*) as count FROM properties GROUP BY status");
        $byStatus = $stmt->fetchAll();
        
        // Leads by status
        $stmt = $db->query("SELECT status, COUNT(*) as count FROM leads GROUP BY status");
        $leadsByStatus = $stmt->fetchAll();
        
        // Recent properties
        $stmt = $db->query("SELECT id, title, price, status, city, created_at FROM properties ORDER BY created_at DESC LIMIT 5");
        $recentProperties = $stmt->fetchAll();
        
        // Recent leads
        $stmt = $db->query("SELECT id, first_name, last_name, email, status, created_at FROM leads ORDER BY created_at DESC LIMIT 5");
        $recentLeads = $stmt->fetchAll();
        
        // Monthly leads trend (last 6 months)
        $stmt = $db->query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count FROM leads WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH) GROUP BY month ORDER BY month");
        $leadsTrend = $stmt->fetchAll();

        // Ensure follow_up_date column exists (may be missing in older DBs)
        try {
            $db->exec("ALTER TABLE lead_activities ADD COLUMN IF NOT EXISTS follow_up_date DATETIME NULL");
        } catch (\Exception $e) {
            // column already exists or DB doesn't support IF NOT EXISTS — ignore
        }

        // Today's scheduled visits (follow_up_date = today)
        $todayVisits = 0;
        try {
            $stmt = $db->query("SELECT COUNT(*) as count FROM lead_activities WHERE activity_type = 'meeting' AND follow_up_date IS NOT NULL AND DATE(follow_up_date) = CURDATE()");
            $todayVisits = (int)($stmt->fetch()['count'] ?? 0);
        } catch (\Exception $e) {
            // column may still not exist — leave count as 0
        }
        
        jsonResponse([
            'properties' => [
                'total' => $totalProperties,
                'active' => $activeProperties,
                'sold' => $soldProperties,
                'totalValue' => round($totalValue, 2),
                'avgPrice' => round($avgPrice, 2),
                'byType' => $byType,
                'byStatus' => $byStatus
            ],
            'leads' => [
                'total' => $totalLeads,
                'newThisMonth' => $newLeadsThisMonth,
                'byStatus' => $leadsByStatus,
                'trend' => $leadsTrend
            ],
            'recent' => [
                'properties' => $recentProperties,
                'leads' => $recentLeads
            ],
            'todayVisits' => (int)$todayVisits
        ]);
    }
    
    public function propertyStats() {
        requireAuth();
        $db = getDB();
        
        $year = $_GET['year'] ?? date('Y');
        
        // Monthly listing trend
        $stmt = $db->prepare("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count FROM properties WHERE YEAR(created_at) = ? GROUP BY month ORDER BY month");
        $stmt->execute([$year]);
        $listingTrend = $stmt->fetchAll();
        
        // Price range distribution (INR)
        $stmt = $db->query("SELECT 
            CASE 
                WHEN price < 5000000 THEN 'Under ₹50L'
                WHEN price < 10000000 THEN '₹50L - ₹1Cr'
                WHEN price < 20000000 THEN '₹1Cr - ₹2Cr'
                WHEN price < 50000000 THEN '₹2Cr - ₹5Cr'
                ELSE 'Above ₹5Cr'
            END as range_label,
            COUNT(*) as count
            FROM properties
            GROUP BY range_label
            ORDER BY MIN(price)");
        $priceDistribution = $stmt->fetchAll();
        
        // Top cities
        $stmt = $db->query("SELECT city, COUNT(*) as count FROM properties GROUP BY city ORDER BY count DESC LIMIT 10");
        $topCities = $stmt->fetchAll();
        
        jsonResponse([
            'listingTrend' => $listingTrend,
            'priceDistribution' => $priceDistribution,
            'topCities' => $topCities
        ]);
    }
    
    public function leadStats() {
        requireAuth();
        $db = getDB();
        
        $year = $_GET['year'] ?? date('Y');
        
        // Monthly lead trend
        $stmt = $db->prepare("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count FROM leads WHERE YEAR(created_at) = ? GROUP BY month ORDER BY month");
        $stmt->execute([$year]);
        $leadTrend = $stmt->fetchAll();
        
        // Conversion funnel
        $stmt = $db->query("SELECT status, COUNT(*) as count FROM leads GROUP BY status ORDER BY FIELD(status, 'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')");
        $funnel = $stmt->fetchAll();
        
        // Source performance
        $stmt = $db->query("SELECT source, COUNT(*) as total, SUM(CASE WHEN status = 'closed_won' THEN 1 ELSE 0 END) as converted FROM leads GROUP BY source");
        $sourcePerformance = $stmt->fetchAll();
        
        jsonResponse([
            'leadTrend' => $leadTrend,
            'funnel' => $funnel,
            'sourcePerformance' => $sourcePerformance
        ]);
    }
}
