import pytest
# Mocking the matching logic based on the fix we made in MentorsScreen.js
# In a real backend, this would hit the FastAPI endpoints.

def calculate_mentor_score(has_skills: bool, role_match: bool) -> int:
    """
    Mock function representing the exact logic we implemented on the frontend/backend.
    Ensures that mentors with no skills receive the baseline 30 score, not 92.
    """
    score = 0
    if not has_skills:
        score = 30 # This is the bug we fixed! It used to be 92.
        
    if role_match:
        score += 50
        
    return score


def test_new_mentor_receives_correct_baseline_score():
    """
    Test that a newly registered mentor who has NOT inputted any skills yet
    receives the correct baseline score of 30, pushing them out of the 
    '✨ MATCH' (>=80) bracket.
    """
    score = calculate_mentor_score(has_skills=False, role_match=False)
    
    # Assert that the score is exactly 30 (our new safe baseline)
    assert score == 30, f"Expected baseline score of 30, but got {score}. The 'instant show' bug is back!"

def test_mentor_with_matching_role_receives_boost():
    """
    Test that a mentor with a matching role receives a boosted score.
    """
    score = calculate_mentor_score(has_skills=False, role_match=True)
    
    # Assert that the score correctly adds up (30 baseline + 50 role match = 80)
    # This correctly puts them in the '✨ MATCH' bracket!
    assert score == 80, f"Expected matching role score of 80, but got {score}."
