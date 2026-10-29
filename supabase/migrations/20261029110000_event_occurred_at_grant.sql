-- 20261001103646 narrowed the learner insert grant to a column list, and 20261029100000 made
-- record_learning_events write occurred_at on every call. Without this grant the security-invoker
-- function fails with 42501 for every signed-in learner. Extend the column list.
grant insert(occurred_at) on public.learning_events to authenticated;
