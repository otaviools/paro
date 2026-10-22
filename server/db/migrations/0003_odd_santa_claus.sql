CREATE TYPE "public"."estado_relatado" AS ENUM('livre', 'apertado', 'lotado');--> statement-breakpoint
CREATE TYPE "public"."tempo_para_achar" AS ENUM('ate_2', 'de_2_a_5', 'mais_de_5', 'desisti');--> statement-breakpoint
CREATE TABLE "codigos_de_verificacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispositivo_id" uuid NOT NULL,
	"email_hash" text NOT NULL,
	"codigo_hash" text NOT NULL,
	"tentativas" smallint DEFAULT 0 NOT NULL,
	"expira_em" timestamp with time zone NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pessoas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_hash" text NOT NULL,
	"reputacao" double precision DEFAULT 1 NOT NULL,
	"relatos_avaliados" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pessoas_emailHash_unique" UNIQUE("email_hash")
);
--> statement-breakpoint
CREATE TABLE "relatos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rua_id" uuid NOT NULL,
	"dia_semana" smallint NOT NULL,
	"faixa_inicio" time NOT NULL,
	"relatado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"estado" "estado_relatado",
	"tempo" "tempo_para_achar",
	"ocupacao" double precision NOT NULL,
	"peso" double precision NOT NULL,
	"perto_da_rua" boolean DEFAULT false NOT NULL,
	"dispositivo_id" uuid,
	"pessoa_id" uuid
);
--> statement-breakpoint
ALTER TABLE "dispositivos" ADD COLUMN "pessoa_id" uuid;--> statement-breakpoint
ALTER TABLE "ruas" ADD COLUMN "capacidade" integer;--> statement-breakpoint
ALTER TABLE "vagas" ADD COLUMN "origem_na_chegada" text;--> statement-breakpoint
ALTER TABLE "codigos_de_verificacao" ADD CONSTRAINT "codigos_de_verificacao_dispositivo_id_dispositivos_id_fk" FOREIGN KEY ("dispositivo_id") REFERENCES "public"."dispositivos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relatos" ADD CONSTRAINT "relatos_rua_id_ruas_id_fk" FOREIGN KEY ("rua_id") REFERENCES "public"."ruas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relatos" ADD CONSTRAINT "relatos_dispositivo_id_dispositivos_id_fk" FOREIGN KEY ("dispositivo_id") REFERENCES "public"."dispositivos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relatos" ADD CONSTRAINT "relatos_pessoa_id_pessoas_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "codigos_email" ON "codigos_de_verificacao" USING btree ("email_hash");--> statement-breakpoint
CREATE INDEX "codigos_dispositivo" ON "codigos_de_verificacao" USING btree ("dispositivo_id");--> statement-breakpoint
CREATE INDEX "relatos_rua_dia_faixa" ON "relatos" USING btree ("rua_id","dia_semana","faixa_inicio");--> statement-breakpoint
CREATE INDEX "relatos_relatado_em" ON "relatos" USING btree ("relatado_em");--> statement-breakpoint
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_pessoa_id_pessoas_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoas"("id") ON DELETE set null ON UPDATE no action;