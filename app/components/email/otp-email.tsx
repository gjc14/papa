import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Preview,
	Section,
	Text,
} from "@react-email/components"

interface OtpEmailProps {
	otp: string
	expireIn?: number
	username: string
	companyName: string
	logoUrl?: string
}

const baseURL =
	process.env.NODE_ENV === "production"
		? process.env.VITE_BASE_URL || "http://localhost:5173"
		: "http://localhost:5173"

export const OtpEmail = ({
	otp,
	expireIn,
	username,
	companyName,
	logoUrl = baseURL + "/logo.png",
}: OtpEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>Your verification code for {companyName}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={logoContainer}>
						<Img
							src={logoUrl}
							width="120"
							height="auth"
							style={logo}
							alt={`${companyName} Logo`}
						/>
					</Section>
					<Hr style={hr} />
					<Section style={section}>
						<Heading style={heading}>Verification Code</Heading>
						<Text style={paragraph}>Hello {username},</Text>
						<Text style={paragraph}>
							Your verification code is below.
							{expireIn &&
								` This code will expire in ${expireIn / 60} minutes.`}
						</Text>
						<Section style={otpContainer}>
							<Text style={otpCode}>{otp}</Text>
						</Section>
						<Text style={paragraph}>
							If you didn't request this code, you can safely ignore this email.
						</Text>
						<Text style={paragraph}>
							Thanks,
							<br />
							The {companyName} Team
						</Text>
					</Section>
					<Hr style={hr} />
					<Section style={footer}>
						<Text style={footerText}>
							© {new Date().getFullYear()} {companyName}. All rights reserved.
						</Text>
						<Text style={footerText}>
							If you have any questions, please contact our support team.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}

export default OtpEmail

// Styles
const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
}

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px 0",
	maxWidth: "600px",
	borderRadius: "4px",
	boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
}

const logoContainer = {
	padding: "20px 30px",
	textAlign: "center" as const,
}

const logo = {
	margin: "0 auto",
}

const hr = {
	borderColor: "#e6ebf1",
	margin: "20px 0",
}

const section = {
	padding: "0 30px",
}

const heading = {
	fontSize: "24px",
	color: "#333",
	textAlign: "center" as const,
	margin: "30px 0",
}

const paragraph = {
	fontSize: "16px",
	lineHeight: "1.5",
	color: "#444",
	margin: "16px 0",
}

const otpContainer = {
	textAlign: "center" as const,
	margin: "30px 0",
	padding: "20px 0",
}

const otpCode = {
	fontSize: "32px",
	fontWeight: "bold",
	color: "#333",
	letterSpacing: "8px",
	padding: "12px 24px",
	background: "#f4f4f7",
	borderRadius: "4px",
	display: "inline-block",
}

const footer = {
	padding: "0 30px 20px",
}

const footerText = {
	fontSize: "12px",
	color: "#777",
	textAlign: "center" as const,
	margin: "8px 0",
}
