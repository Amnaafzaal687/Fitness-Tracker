class WorkoutPlanService {
    
    getSuggestedPlan(fitnessLevel, workoutType) {
        // Normalize values to lowercase
        fitnessLevel = fitnessLevel.toLowerCase();
        workoutType = workoutType.toLowerCase();

        const fitnessLevelMappings = {
            'begineer': 'beginner', 
            'advance': 'advanced', 
        };
        fitnessLevel = fitnessLevelMappings[fitnessLevel] || fitnessLevel;

        let viewToRender = '';

        // Logic to determine which view to render
        switch (true) {
            case fitnessLevel === 'beginner' && workoutType === 'arms':
                viewToRender = 'suggestedplan2';
                break;
            case fitnessLevel === 'advanced' && workoutType === 'arms':
                viewToRender = 'suggestedplan1';
                break;
            case fitnessLevel === 'beginner' && workoutType === 'legs':
                viewToRender = 'suggestedplan4';
                break;
            case fitnessLevel === 'advanced' && workoutType === 'legs':
                viewToRender = 'suggestedplan3';
                break;
            case fitnessLevel === 'beginner' && workoutType === 'fb':
                viewToRender = 'suggestedplan6';
                break;
            case fitnessLevel === 'advanced' && workoutType === 'fb':
                viewToRender = 'suggestedplan5';
                break;
            default:
                throw new Error('Invalid fitness level or workout type');
        }
        return viewToRender;
    }
}
module.exports = new WorkoutPlanService();
