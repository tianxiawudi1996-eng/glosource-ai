-- GloSource uses a server-side PostgreSQL connection, not the Supabase Data API.
-- Keep the Data API fail-closed while preserving table-owner access for the app server.
DO $migration$
DECLARE
	protected_table text;
	protected_tables constant text[] := ARRAY[
		'abuse_events',
		'abuse_identities',
		'accounts',
		'blog_posts',
		'kr_cosmetics_firms',
		'kr_dart_firms',
		'kr_haccp_firms',
		'kr_health_food_firms',
		'kr_medical_device_firms',
		'kr_quasi_drug_firms',
		'payments',
		'quota_reservations',
		'search_history',
		'sessions',
		'social_posts',
		'subscriptions',
		'usage_logs',
		'users',
		'verification_tokens',
		'verified_suppliers',
		'waitlist'
	];
BEGIN
	FOREACH protected_table IN ARRAY protected_tables LOOP
		IF to_regclass(format('public.%I', protected_table)) IS NULL THEN
			RAISE EXCEPTION 'RLS lockdown expected public.% but the table does not exist', protected_table;
		END IF;

		EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', protected_table);

		IF NOT EXISTS (
			SELECT 1
			FROM pg_policy policy
			JOIN pg_class relation ON relation.oid = policy.polrelid
			JOIN pg_namespace namespace ON namespace.oid = relation.relnamespace
			WHERE namespace.nspname = 'public'
				AND relation.relname = protected_table
				AND policy.polname = 'glo_data_api_deny_all'
		) THEN
			EXECUTE format(
				'CREATE POLICY glo_data_api_deny_all ON public.%I AS RESTRICTIVE FOR ALL TO PUBLIC USING (false) WITH CHECK (false)',
				protected_table
			);
		END IF;
	END LOOP;
END
$migration$;
--> statement-breakpoint
-- Supabase creates these roles; Neon and generic PostgreSQL commonly do not.
-- Conditional role handling keeps the same forward migration portable.
DO $migration$
DECLARE
	api_role text;
	object_owner text;
BEGIN
	FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
		CONTINUE WHEN NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role);

		EXECUTE format('REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM %I', api_role);
		EXECUTE format('REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM %I', api_role);
		EXECUTE format('REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM %I', api_role);

		FOR object_owner IN
			SELECT DISTINCT pg_get_userbyid(relation.relowner)
			FROM pg_class relation
			JOIN pg_namespace namespace ON namespace.oid = relation.relnamespace
			JOIN pg_policy policy ON policy.polrelid = relation.oid
			WHERE namespace.nspname = 'public'
				AND policy.polname = 'glo_data_api_deny_all'
		LOOP
			IF object_owner <> current_user AND NOT pg_has_role(current_user, object_owner, 'MEMBER') THEN
				RAISE EXCEPTION 'Migration role % cannot secure default privileges for table owner %', current_user, object_owner;
			END IF;

			EXECUTE format(
				'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL PRIVILEGES ON TABLES FROM %I',
				object_owner,
				api_role
			);
			EXECUTE format(
				'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL PRIVILEGES ON SEQUENCES FROM %I',
				object_owner,
				api_role
			);
			EXECUTE format(
				'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL PRIVILEGES ON FUNCTIONS FROM %I',
				object_owner,
				api_role
			);
		END LOOP;
	END LOOP;
END
$migration$;
