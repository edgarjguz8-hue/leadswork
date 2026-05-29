CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain" (
	"id" text PRIMARY KEY NOT NULL,
	"normalizedName" text NOT NULL,
	"displayName" text NOT NULL,
	"buyPrice" integer NOT NULL,
	"leasePrice" integer NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"score" integer NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"buyerId" text,
	"leaserId" text,
	"ownerId" text,
	"purchasedAt" timestamp,
	"leaseStartAt" timestamp,
	"leaseExpiresAt" timestamp,
	"externallyRegistered" boolean DEFAULT false,
	"verificationStatus" text DEFAULT 'unverified',
	"verificationId" text,
	"lastExternalCheck" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domain_normalizedName_unique" UNIQUE("normalizedName")
);
--> statement-breakpoint
CREATE TABLE "domainAvailabilityCache" (
	"id" text PRIMARY KEY NOT NULL,
	"normalizedName" text NOT NULL,
	"isAvailable" boolean NOT NULL,
	"externallyRegistered" boolean NOT NULL,
	"lastChecked" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domainAvailabilityCache_normalizedName_unique" UNIQUE("normalizedName")
);
--> statement-breakpoint
CREATE TABLE "domainVerification" (
	"id" text PRIMARY KEY NOT NULL,
	"domainId" text NOT NULL,
	"userId" text NOT NULL,
	"verificationCode" text NOT NULL,
	"verificationStatus" text DEFAULT 'pending_verification' NOT NULL,
	"verifiedAt" timestamp,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "userDomain" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"domainId" text NOT NULL,
	"type" text NOT NULL,
	"priceInCents" integer NOT NULL,
	"stripeSessionId" text NOT NULL,
	"purchasedAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userDomain_stripeSessionId_unique" UNIQUE("stripeSessionId")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_buyerId_user_id_fk" FOREIGN KEY ("buyerId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_leaserId_user_id_fk" FOREIGN KEY ("leaserId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_verificationId_domainVerification_id_fk" FOREIGN KEY ("verificationId") REFERENCES "public"."domainVerification"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domainVerification" ADD CONSTRAINT "domainVerification_domainId_domain_id_fk" FOREIGN KEY ("domainId") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domainVerification" ADD CONSTRAINT "domainVerification_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userDomain" ADD CONSTRAINT "userDomain_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userDomain" ADD CONSTRAINT "userDomain_domainId_domain_id_fk" FOREIGN KEY ("domainId") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;