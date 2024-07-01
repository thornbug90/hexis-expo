UPDATE WearableSource WHERE type = 'unspecified'
SET type = CASE
  WHEN source = 'TP' THEN 'remote'
  WHEN source IN ('apple health', 'health connect') THEN 'local'
  ELSE 'UNSPECIFIED'
END;
