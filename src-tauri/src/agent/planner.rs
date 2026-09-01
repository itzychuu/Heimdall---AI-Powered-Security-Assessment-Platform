use super::models::{
    AgentAction,
    AssessmentPlan,
    AssessmentRequest,
};

pub fn create_plan(
    request: &AssessmentRequest,
) -> Result<AssessmentPlan, String> {
    if request.target.value.trim().is_empty() {
        return Err(
            "Assessment target cannot be empty."
                .to_string(),
        );
    }

    if request.objective.trim().is_empty() {
        return Err(
            "Assessment objective cannot be empty."
                .to_string(),
        );
    }

    /*
     * The real AI planner will eventually live behind
     * this interface.
     *
     * For now we deliberately return an empty plan.
     *
     * This gives the rest of Heimdall a stable contract
     * without allowing an unfinished AI layer to execute
     * anything.
     */

    Ok(AssessmentPlan {
        objective: request.objective.clone(),
        actions: Vec::<AgentAction>::new(),
    })
}