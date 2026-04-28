ALTER TABLE leads
MODIFY COLUMN status ENUM('new', 'contacted', 'qualified', 'proposal', 'visit', 'negotiation', 'closed_won', 'closed_lost') DEFAULT 'new';

ALTER TABLE lead_activities
ADD COLUMN follow_up_date DATETIME NULL AFTER description,
ADD COLUMN property_interest_id INT NULL AFTER follow_up_date,
ADD CONSTRAINT fk_lead_activities_property
  FOREIGN KEY (property_interest_id) REFERENCES properties(id) ON DELETE SET NULL;
