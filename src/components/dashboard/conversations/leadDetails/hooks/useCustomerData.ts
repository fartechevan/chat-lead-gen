
import { useState, useCallback } from "react";
import { Customer, Lead } from "../../types";
import { fetchCustomerById } from "./utils/customerUtils";
import { 
  createFakeLeadFromCustomer, 
  calculateDaysSinceCreation 
} from "./utils/leadUtils";
import { supabase } from "@/integrations/supabase/client";

export function useCustomerData(setLead: React.Dispatch<React.SetStateAction<Lead | null>>) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  const handleCustomerFetch = useCallback(async (customerId: string, profiles: any[]) => {
    const customerData = await fetchCustomerById(customerId);
    
    if (customerData) {
      setCustomer(customerData);
      
      const { data, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
      
      if (leadError) {
        console.error('Error fetching lead:', leadError);
      } else if (data) {
        // Create a properly typed Lead object with data from both lead and customer
        const leadData: Lead = {
          id: data.id,
          created_at: data.created_at,
          updated_at: data.updated_at || undefined,
          user_id: data.user_id,
          pipeline_stage_id: data.pipeline_stage_id || null,
          customer_id: data.customer_id || null,
          value: data.value || null,
          
          // Virtual properties derived from customer data
          name: customerData.name || null,
          company_name: customerData.company_name || null,
          company_address: customerData.company_address || null,
          contact_email: customerData.email || null,
          contact_phone: customerData.phone_number || null,
          contact_first_name: customerData.name || null // Using customer name as first name
        };
        
        console.log("Handling lead data:", leadData);
        setLead(leadData);
        
        return { lead: leadData, customer: customerData };
      } else {
        // Create a fake lead since we have a customer but no lead
        const fakeLead = createFakeLeadFromCustomer(
          customerData, 
          new Date().toISOString(), 
          profiles[0]?.id || 'no-user'
        );
        setLead(fakeLead);
        return { lead: fakeLead, customer: customerData };
      }
    }
    
    return { lead: null, customer: null };
  }, [setLead]);

  return {
    customer,
    setCustomer,
    handleCustomerFetch
  };
}
