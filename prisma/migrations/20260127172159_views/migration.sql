DROP VIEW IF EXISTS course_sessions_by_preference;

CREATE OR REPLACE VIEW course_sessions_by_preference AS
SELECT
  ce.user_id,
  ce.course_id,
  ce.preferred_session_id,
  preferred.session_number AS session_option,
  CASE preferred.session_number
    WHEN 1 THEN 'Morning'
    WHEN 2 THEN 'Evening'
    ELSE 'Unknown'
  END AS session_label,
  json_agg(
    json_build_object(
      'datetime', s.session_timestamp,
      'link', s.session_link,
      'recordingLink', s.recording_link,
      'duration', s.hour_per_session,
      'label', CASE s.session_number
                 WHEN 1 THEN 'Morning'
                 WHEN 2 THEN 'Evening'
                 ELSE 'Unknown'
               END
    )
  ) AS sessions
FROM course_enrollments ce
JOIN sessions preferred ON preferred.session_id = ce.preferred_session_id
JOIN sessions s ON s.course_id = ce.course_id AND s.session_number = preferred.session_number
GROUP BY ce.user_id, ce.course_id, ce.preferred_session_id, preferred.session_number;