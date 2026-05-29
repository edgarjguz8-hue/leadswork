-- Add foreign key constraints for domain table
ALTER TABLE "domain" ADD CONSTRAINT "domain_buyerId_user_id_fk" FOREIGN KEY ("buyerId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "domain" ADD CONSTRAINT "domain_leaserId_user_id_fk" FOREIGN KEY ("leaserId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "domain" ADD CONSTRAINT "domain_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "domain" ADD CONSTRAINT "domain_verificationId_domainVerification_id_fk" FOREIGN KEY ("verificationId") REFERENCES "public"."domainVerification"("id") ON DELETE set null ON UPDATE no action;

-- Add foreign key constraints for domainVerification table
ALTER TABLE "domainVerification" ADD CONSTRAINT "domainVerification_domainId_domain_id_fk" FOREIGN KEY ("domainId") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "domainVerification" ADD CONSTRAINT "domainVerification_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

-- Add foreign key constraint for userDomain table
ALTER TABLE "userDomain" ADD CONSTRAINT "userDomain_domainId_domain_id_fk" FOREIGN KEY ("domainId") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;
