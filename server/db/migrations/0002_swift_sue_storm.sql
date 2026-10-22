CREATE TABLE "estimativas_da_pesquisa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rua_id" uuid NOT NULL,
	"pergunta" smallint NOT NULL,
	"percentual" smallint NOT NULL,
	"base" smallint NOT NULL,
	"intervalo_min" double precision NOT NULL,
	"intervalo_max" double precision NOT NULL,
	"nivel_de_confianca" smallint NOT NULL,
	"metodo" text NOT NULL,
	"calculado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "estimativas_da_pesquisa_ruaId_unique" UNIQUE("rua_id")
);
--> statement-breakpoint
ALTER TABLE "estimativas_da_pesquisa" ADD CONSTRAINT "estimativas_da_pesquisa_rua_id_ruas_id_fk" FOREIGN KEY ("rua_id") REFERENCES "public"."ruas"("id") ON DELETE cascade ON UPDATE no action;