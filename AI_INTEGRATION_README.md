# AI-Powered Workout Tracker - Integration Guide

## 🚀 Overview

This workout tracker now features **real AI integration** using OpenAI's GPT models to provide truly personalized workout plans. The system intelligently analyzes user profiles, generates contextual questions, creates custom workout plans, and processes feedback to make intelligent adjustments.

## 🔑 Setup

### 1. Environment Variables
Create a `.env` file in your project root:

```bash
# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (existing)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Install Dependencies
```bash
npm install openai
```

## 🤖 AI Models & Cost Optimization

### Model Selection Strategy
We use different models based on task complexity to optimize costs:

| Task | Model | Cost (per 1M tokens) | Use Case |
|------|-------|----------------------|----------|
| **Follow-up Questions** | `gpt-4o-mini` | $0.15 input, $0.60 output | Basic question generation |
| **Workout Plan Generation** | `gpt-4o` | $2.50 input, $10.00 output | Complex reasoning & planning |
| **Feedback Processing** | `gpt-4o` | $2.50 input, $10.00 output | Intelligent plan modifications |
| **Exercise Alternatives** | `gpt-4o-mini` | $0.15 input, $0.60 output | Simple exercise suggestions |

### Cost Estimates (Per User Session)
- **Complete AI Workout Planning**: $0.06 - $0.20
- **Follow-up Questions**: $0.01 - $0.05
- **Workout Plan Generation**: $0.05 - $0.15
- **Feedback Adjustments**: $0.03 - $0.10 per feedback

## 🧠 AI Features

### 1. **Intelligent Follow-up Questions**
- Analyzes user profile to generate contextual questions
- Focuses on experience level, goals, equipment, and injuries
- Uses `gpt-4o-mini` for cost efficiency

### 2. **Personalized Workout Plans**
- Creates 2-3 unique workout plans based on user profile
- Considers equipment availability, injury limitations, and goals
- Uses `gpt-4o` for complex reasoning and safety

### 3. **AI-Powered Feedback Processing**
- Intelligently modifies plans based on natural language feedback
- Maintains safety and effectiveness while making adjustments
- Uses `gpt-4o` for nuanced understanding

### 4. **Exercise Alternatives**
- Suggests safe alternatives based on available equipment
- Considers injury limitations and skill level
- Uses `gpt-4o-mini` for simple suggestions

## 📊 Cost Monitoring

### Real-time Cost Tracking
The system includes a cost monitor that tracks:
- Total session cost
- Cost per operation type
- Real-time updates during AI usage

### Cost Event System
```typescript
// Cost events are automatically dispatched
window.addEventListener('ai-cost-log', (event) => {
  const { operation, cost } = event.detail
  console.log(`${operation}: $${cost}`)
})
```

## 🔧 Implementation Details

### AI Service Structure
```typescript
// Core AI functions
export const generateFollowUpQuestions = async (profile: UserProfile)
export const generateWorkoutPlans = async (profile: UserProfile, answers: Record<string, string>)
export const processWorkoutFeedback = async (plan: any, feedback: string, profile: UserProfile)
export const generateExerciseAlternatives = async (exercise: string, equipment: string[], injuries: string[])
```

### Error Handling & Fallbacks
- **Graceful Degradation**: Falls back to rule-based logic if AI fails
- **User Feedback**: Clear error messages when AI service is unavailable
- **Cost Transparency**: Users see estimated costs before proceeding

### Prompt Engineering
- **Structured Prompts**: Clear instructions for consistent AI responses
- **Safety Focus**: Emphasizes user safety and injury considerations
- **JSON Output**: Structured responses for reliable parsing

## 🚨 Security Considerations

### Current Implementation
- **Frontend API Calls**: Uses `dangerouslyAllowBrowser: true` for development
- **API Key Exposure**: Keys are visible in browser (not recommended for production)

### Production Recommendations
1. **Backend API**: Move AI calls to your backend server
2. **API Key Security**: Store keys securely on server side
3. **Rate Limiting**: Implement user rate limiting
4. **Input Validation**: Sanitize all user inputs before sending to AI

## 📈 Performance Optimization

### Token Usage Optimization
- **Efficient Prompts**: Minimize redundant information
- **Context Management**: Only send relevant user data
- **Response Limits**: Set appropriate `max_tokens` for each task

### Caching Strategy
- **User Profiles**: Cache profile data to reduce API calls
- **Common Plans**: Store frequently requested plan types
- **Exercise Database**: Maintain local exercise alternatives

## 🧪 Testing

### Test AI Integration
1. **Set API Key**: Add your OpenAI key to `.env`
2. **Start Application**: `npm run dev`
3. **Navigate to AI Planning**: Go to "AI Workout Planning"
4. **Complete Flow**: Test questionnaire → AI questions → plan generation
5. **Test Feedback**: Submit feedback and verify AI adjustments

### Monitor Costs
- Watch browser console for cost logs
- Check cost monitor widget (bottom-right)
- Verify fallback behavior when AI fails

## 🔮 Future Enhancements

### Advanced AI Features
- **Progressive Learning**: AI learns from user success/failure
- **Dynamic Adjustments**: Real-time plan modifications during workouts
- **Nutrition Integration**: AI-powered meal planning
- **Recovery Optimization**: Intelligent rest day scheduling

### Cost Optimization
- **Model Fine-tuning**: Custom models for fitness-specific tasks
- **Batch Processing**: Group similar requests to reduce costs
- **Smart Caching**: AI-powered response caching

## 📚 API Reference

### OpenAI Models Used
- **GPT-4o**: Advanced reasoning, complex planning
- **GPT-4o-mini**: Cost-effective, simple tasks
- **GPT-3.5 Turbo**: Backup for basic text processing

### Rate Limits
- **GPT-4o**: 500 requests per minute
- **GPT-4o-mini**: 500 requests per minute
- **GPT-3.5 Turbo**: 3500 requests per minute

## 🆘 Troubleshooting

### Common Issues
1. **API Key Invalid**: Check `.env` file and key validity
2. **Rate Limit Exceeded**: Wait and retry, or upgrade plan
3. **JSON Parse Errors**: Check AI response format
4. **High Costs**: Review token usage and optimize prompts

### Debug Mode
```typescript
// Enable detailed logging
console.log('AI Response:', aiResponse)
console.log('Token Usage:', aiResponse.tokenUsage)
console.log('Estimated Cost:', aiResponse.tokenUsage?.estimatedCost)
```

## 💡 Best Practices

### For Users
- Be specific in feedback for better AI understanding
- Provide detailed injury information for safety
- Use natural language (e.g., "I want more leg exercises")

### For Developers
- Monitor costs regularly
- Implement proper error handling
- Test fallback scenarios
- Keep prompts focused and efficient

---

## 🎯 Quick Start

1. **Get OpenAI API Key** from [OpenAI Platform](https://platform.openai.com/)
2. **Add to .env**: `VITE_OPENAI_API_KEY=your_key_here`
3. **Install package**: `npm install openai`
4. **Start app**: `npm run dev`
5. **Test AI features**: Navigate to AI Workout Planning

The system will automatically use AI for personalized workout planning while maintaining cost efficiency and fallback reliability!
