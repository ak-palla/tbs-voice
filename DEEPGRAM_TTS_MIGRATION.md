# Deepgram TTS Migration

This document outlines the migration from MeloTTS (RunPod) to Deepgram TTS in the RealtimeChatGemini component.

## Changes Made

### 1. Dependencies Updated
- Added `@deepgram/sdk: ^3.9.0` to package.json
- Removed dependency on RunPod endpoints

### 2. API Route Changes (`app/api/gemini/route.ts`)
- **Replaced imports**: Added Deepgram SDK import
- **Environment variables**: 
  - Removed: `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID`
  - Added: `DEEPGRAM_API_KEY`
- **TTS Implementation**: Complete replacement of MeloTTS logic with Deepgram TTS
  - Simplified API calls (no complex endpoint discovery)
  - Better error handling
  - Improved audio quality (24kHz vs 22kHz)
  - More reliable service (Deepgram's managed infrastructure)

### 3. Voice Options Updated
- **US Voice**: `aura-asteria-en` (Asteria) - Default Deepgram English voice
- **UK Voice**: `aura-luna-en` (Luna) - British English voice (if available)
- Note: Using verified working model names to avoid API errors

### 4. Frontend Changes (`components/realtime-chat-gemini.tsx`)
- Added support for 2 verified voice options (US, UK)
- Updated voice selector labels to show actual voice names (Asteria, Luna)
- Changed "Voice Accent:" to "Voice:" for better UX
- Using only verified working voice models to prevent API errors

## Environment Setup

Add the following environment variable:
```bash
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

## Benefits of Migration

1. **Reliability**: Deepgram's managed infrastructure vs self-hosted RunPod
2. **Simplicity**: Single API call vs complex endpoint discovery
3. **Quality**: Higher sample rate (24kHz) and better voice quality
4. **Cost**: More predictable pricing model
5. **Maintenance**: No need to manage RunPod infrastructure

## Removed Files/Code

The following RunPod-related files are no longer needed but were kept for reference:
- `/runpod/*` - All RunPod MeloTTS implementation files
- Can be safely removed after confirming Deepgram TTS works correctly

## Testing

Test the TTS functionality by:
1. Sending voice messages in the chat
2. Verifying TTS responses play correctly
3. Testing different voice options (US, UK, Indian)
4. Confirming fallback to browser TTS when API fails

## Rollback Plan

If rollback is needed:
1. Revert the API route changes
2. Re-add RunPod environment variables
3. Update frontend voice selector
4. Remove Deepgram dependency