CREATE TYPE "public"."fonte_medicao" AS ENUM('campo', 'registro_anonimo');--> statement-breakpoint
CREATE TABLE "areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cidade" text NOT NULL,
	"nome_da_referencia" text NOT NULL,
	"referencia" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avaliacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"previsao_ajudou" boolean NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispositivos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"preferencias" jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rua_id" uuid NOT NULL,
	"dia_semana" smallint NOT NULL,
	"faixa_inicio" time NOT NULL,
	"vagas_totais" integer NOT NULL,
	"vagas_ocupadas" integer NOT NULL,
	"fonte" "fonte_medicao" NOT NULL,
	"medido_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resultados_da_pesquisa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pergunta" smallint NOT NULL,
	"grupo" text DEFAULT 'Todos' NOT NULL,
	"ordem" smallint NOT NULL,
	"opcao" text NOT NULL,
	"percentual" smallint NOT NULL,
	"base" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ruas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"area_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"trajeto" jsonb NOT NULL,
	"distancia_da_referencia_m" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sugestoes_de_rua" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome_da_rua" text NOT NULL,
	"periodos" text[] DEFAULT '{}' NOT NULL,
	"motivo" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vagas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispositivo_id" uuid NOT NULL,
	"rua_id" uuid NOT NULL,
	"chegada" timestamp with time zone NOT NULL,
	"saida_prevista" timestamp with time zone,
	"saida" timestamp with time zone,
	"previsao_ajudou" boolean,
	"avisar_ao_sair" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "medicoes" ADD CONSTRAINT "medicoes_rua_id_ruas_id_fk" FOREIGN KEY ("rua_id") REFERENCES "public"."ruas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ruas" ADD CONSTRAINT "ruas_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vagas" ADD CONSTRAINT "vagas_dispositivo_id_dispositivos_id_fk" FOREIGN KEY ("dispositivo_id") REFERENCES "public"."dispositivos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vagas" ADD CONSTRAINT "vagas_rua_id_ruas_id_fk" FOREIGN KEY ("rua_id") REFERENCES "public"."ruas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "medicoes_rua_dia_faixa" ON "medicoes" USING btree ("rua_id","dia_semana","faixa_inicio");--> statement-breakpoint
CREATE INDEX "vagas_dispositivo" ON "vagas" USING btree ("dispositivo_id");