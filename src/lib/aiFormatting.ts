// Utility function to clean AI responses from markdown formatting
export const cleanAIResponse = (text: string): string => {
  if (!text) return text

  // Remove markdown formatting
  let cleaned = text
    // Remove bold/italic markdown
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')

  return cleaned
}

// Enhanced function for workout chat responses
export const formatWorkoutChatResponse = (text: string): string => {
  if (!text) return text

  let formatted = cleanAIResponse(text)
  
  // Add some basic formatting for better readability
  formatted = formatted
    // Convert numbered lists to proper format
    .replace(/^(\d+\.\s+.*)$/gm, '$1')
    // Ensure proper spacing around lists
    .replace(/([.!?])\n(•)/g, '$1\n\n$2')
    // Clean up any remaining markdown artifacts
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '')

  return formatted.trim()
}
