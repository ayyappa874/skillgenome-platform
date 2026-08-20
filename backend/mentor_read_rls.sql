-- Allow mentors to read their mentees' data
CREATE POLICY "Mentors can read mentee resume analyses" ON resume_analyses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentorship_requests
      WHERE mentorship_requests.student_id = resume_analyses.user_id
      AND mentorship_requests.mentor_id = auth.uid()
      AND mentorship_requests.status = 'accepted'
    )
    OR EXISTS (
      SELECT 1 FROM cohort_students
      JOIN cohorts ON cohorts.id = cohort_students.cohort_id
      WHERE cohort_students.student_id = resume_analyses.user_id
      AND cohorts.mentor_id = auth.uid()
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Mentors can read mentee github analyses" ON github_analyses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentorship_requests
      WHERE mentorship_requests.student_id = github_analyses.user_id
      AND mentorship_requests.mentor_id = auth.uid()
      AND mentorship_requests.status = 'accepted'
    )
    OR EXISTS (
      SELECT 1 FROM cohort_students
      JOIN cohorts ON cohorts.id = cohort_students.cohort_id
      WHERE cohort_students.student_id = github_analyses.user_id
      AND cohorts.mentor_id = auth.uid()
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Mentors can read mentee thought analyses" ON thought_analyses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentorship_requests
      WHERE mentorship_requests.student_id = thought_analyses.user_id
      AND mentorship_requests.mentor_id = auth.uid()
      AND mentorship_requests.status = 'accepted'
    )
    OR EXISTS (
      SELECT 1 FROM cohort_students
      JOIN cohorts ON cohorts.id = cohort_students.cohort_id
      WHERE cohort_students.student_id = thought_analyses.user_id
      AND cohorts.mentor_id = auth.uid()
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Mentors can read mentee emotions" ON emotions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentorship_requests
      WHERE mentorship_requests.student_id = emotions.user_id
      AND mentorship_requests.mentor_id = auth.uid()
      AND mentorship_requests.status = 'accepted'
    )
    OR EXISTS (
      SELECT 1 FROM cohort_students
      JOIN cohorts ON cohorts.id = cohort_students.cohort_id
      WHERE cohort_students.student_id = emotions.user_id
      AND cohorts.mentor_id = auth.uid()
    )
    OR auth.uid() = user_id
  );
