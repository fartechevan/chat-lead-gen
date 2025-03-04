
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"
import { extractMessageContent } from "./utils.ts"
import { findOrCreateCustomer } from "./customerHandler.ts"
import { findOrCreateConversation } from "./conversationHandler.ts"

/**
 * Handles a WhatsApp message event
 */
export async function handleMessageEvent(supabaseClient: SupabaseClient, data: any, instanceId: string): Promise<boolean> {
  console.log('Processing message event with data:', JSON.stringify(data, null, 2));
  
  if (!data || !data.key || !data.key.remoteJid) {
    console.error('Invalid message data structure');
    return false;
  }

  const remoteJid = data.key.remoteJid;
  const fromMe = data.key.fromMe || false;
  const contactName = data.pushName || remoteJid.split('@')[0];
  const messageText = extractMessageContent(data);
  
  console.log(`Processing message from ${fromMe ? 'owner' : 'customer'} ${contactName} (${remoteJid}): ${messageText}`);
  
  // Hardcode the integration config ID
  const integrationsConfigId = 'bda44db7-4e9a-4733-a9c7-c4f5d7198905';

  // Fetch the integration config
  const { data: config, error: configError } = await supabaseClient
    .from('integrations_config')
    .select('id, user_reference_id')
    .eq('id', integrationsConfigId)
    .maybeSingle();

  if (configError) {
    console.error('Error fetching integration config:', configError);
    return false;
  }

  if (!config) {
    console.error('No integration config found for id:', integrationsConfigId);
    return false;
  }

  // Extract phone number from remoteJid
  const phoneNumber = remoteJid.split('@')[0];
  console.log(`Extracted phone number: ${phoneNumber}`);

  // Customer handling
  let customerId: string | null = null;
  if (!fromMe) {
    customerId = await findOrCreateCustomer(supabaseClient, phoneNumber, contactName);
    if (!customerId) return false;
  }
  
  // Conversation handling
  const { appConversationId, participantId } = await findOrCreateConversation(
    supabaseClient,
    remoteJid,
    config,
    fromMe,
    customerId // Pass customerId to findOrCreateConversation
  );
  
  if (!appConversationId || !participantId) {
    console.error('Failed to find or create conversation/participant');
    return false;
  }
  // Create message in app
  if (appConversationId && participantId) {
    const { data: newMessage, error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: appConversationId,
        content: messageText,
        sender_participant_id: participantId,
      })
      .select();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return false;
    }

    console.log(`Created new message in conversation ${appConversationId} from participant ${participantId}`);
    return true;
  } else {
    console.error('appConversationId or participantId is null');
    return false;
  }
}
