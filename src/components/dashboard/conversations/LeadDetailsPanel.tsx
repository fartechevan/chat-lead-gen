
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Conversation } from "./types";
import { 
  LeadHeader,
  LeadTags,
  PipelineSelector,
  LeadContactInfo,
  LeadTabContent
} from "./leadDetails";
import { EmptyLeadState } from "./leadDetails/EmptyLeadState";
import {
  useLeadData,
  useLeadPipeline,
  useLeadTags,
  useAssignee
} from "./leadDetails/hooks";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LeadDetailsPanelProps {
  isExpanded: boolean;
  onToggle: () => void;
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;
  queryClient: any;
}

export function LeadDetailsPanel({
  isExpanded,
  onToggle,
  selectedConversation,
  setSelectedConversation,
  queryClient,
}: LeadDetailsPanelProps) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("main");
  
  // Custom hooks for managing different aspects of the lead details panel
  const { 
    isLoading, 
    customer, 
    lead, 
    daysSinceCreation, 
    setLead 
  } = useLeadData(isExpanded, selectedConversation, profiles);
  
  const {
    allPipelines,
    selectedPipeline,
    selectedStage,
    handlePipelineChange,
    handleStageChange
  } = useLeadPipeline(lead, selectedConversation, isExpanded);
  
  const {
    tags,
    setTags,
    isTagsLoading,
    handleAddTag,
    handleRemoveTag
  } = useLeadTags(lead);
  
  const {
    selectedAssignee,
    handleAssigneeChange,
    fetchProfiles
  } = useAssignee(profiles, lead);

  // Fetch profiles when expanded
  useEffect(() => {
    if (isExpanded) {
      const getProfiles = async () => {
        const profilesData = await fetchProfiles();
        setProfiles(profilesData);
      };
      getProfiles();
    }
  }, [isExpanded, fetchProfiles]);

  return (
    <div className={cn(
      "border-r bg-background transition-all duration-300 flex flex-col",
      isExpanded ? "w-[320px]" : "w-10"
    )}>
      <LeadHeader 
        isExpanded={isExpanded} 
        onToggle={onToggle} 
        lead={lead} 
        isLoading={isLoading} 
      />

      {isExpanded && (
        <div className="flex-1 overflow-auto flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="h-4 w-32 bg-muted rounded"></div>
                <div className="h-3 w-40 bg-muted rounded"></div>
              </div>
            </div>
          ) : lead ? (
            <>
              <div className="p-4 space-y-4">
                {lead && selectedConversation && (
                  <div className="text-xs text-muted-foreground">
                    {selectedConversation.lead_id === lead.id ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Connected to conversation
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        Not connected to current conversation
                      </span>
                    )}
                  </div>
                )}
                
                <LeadTags 
                  tags={tags} 
                  setTags={setTags} 
                  onAddTag={handleAddTag} 
                  onRemoveTag={handleRemoveTag}
                  isLoading={isTagsLoading}
                />

                <PipelineSelector 
                  selectedPipeline={selectedPipeline}
                  selectedStage={selectedStage}
                  allPipelines={allPipelines}
                  daysSinceCreation={daysSinceCreation}
                  onPipelineChange={handlePipelineChange}
                  onStageChange={handleStageChange}
                />
              </div>
              
              <Tabs defaultValue="main" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <div className="border-t border-b">
                  <TabsList className="w-full h-auto grid grid-cols-4 rounded-none bg-background p-0">
                    <TabsTrigger value="main" className="py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">Main</TabsTrigger>
                    <TabsTrigger value="statistics" className="py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">Statistics</TabsTrigger>
                    <TabsTrigger value="media" className="py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">Media</TabsTrigger>
                    <TabsTrigger value="setup" className="py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">Setup</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="main" className="flex-1 overflow-auto p-0 m-0">
                  <LeadContactInfo 
                    customer={customer} 
                    lead={lead} 
                  />
                  
                  <LeadTabContent 
                    activeTab={activeTab}
                    profiles={profiles}
                    selectedAssignee={selectedAssignee}
                    onAssigneeChange={handleAssigneeChange}
                    customer={customer}
                    lead={lead}
                    isLoading={isLoading}
                  />
                </TabsContent>
                
                <TabsContent value="statistics" className="flex-1 p-4 m-0">
                  <LeadTabContent 
                    activeTab={activeTab}
                    profiles={profiles}
                    selectedAssignee={selectedAssignee}
                    onAssigneeChange={handleAssigneeChange}
                    customer={customer}
                    lead={lead}
                    isLoading={isLoading}
                  />
                </TabsContent>
                
                <TabsContent value="media" className="flex-1 p-4 m-0">
                  <LeadTabContent 
                    activeTab={activeTab}
                    profiles={profiles}
                    selectedAssignee={selectedAssignee}
                    onAssigneeChange={handleAssigneeChange}
                    customer={customer}
                    lead={lead}
                    isLoading={isLoading}
                  />
                </TabsContent>
                
                <TabsContent value="setup" className="flex-1 p-4 m-0">
                  <LeadTabContent 
                    activeTab={activeTab}
                    profiles={profiles}
                    selectedAssignee={selectedAssignee}
                    onAssigneeChange={handleAssigneeChange}
                    customer={customer}
                    lead={lead}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <EmptyLeadState 
              conversationId={selectedConversation?.conversation_id || ''}
              onLeadCreated={async (leadId) => {
                console.log("Lead created:", leadId);
                // Invalidate the conversations query to refetch conversations
                await queryClient.invalidateQueries({ queryKey: ['conversations'] });

                // Fetch the updated conversation data
                const { data: updatedConversation, error } = await supabase
                  .from('conversations')
                  .select('*')
                  .eq('conversation_id', selectedConversation?.conversation_id || '')
                  .single();

                if (error) {
                  console.error("Error fetching updated conversation:", error);
                  return;
                }

                // Update the selected conversation state
                setSelectedConversation(updatedConversation as Conversation);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
