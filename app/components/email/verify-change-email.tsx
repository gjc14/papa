import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Img,
	Preview,
	Section,
	Text,
} from "@react-email/components"

interface VerifyChangeEmailProps {
	userFirstname: string
	appName: string
	verifyLink: string
	logoUrl: string
	newEmail: string
}

const baseURL =
	process.env.NODE_ENV === "production"
		? process.env.VITE_BASE_URL || "http://localhost:5173"
		: "http://localhost:5173"

export const VerifyChangeEmail = ({
	userFirstname,
	appName,
	verifyLink,
	logoUrl = baseURL + "/logo.png",
	newEmail,
}: VerifyChangeEmailProps) => (
	<Html>
		<Head />
		<Body style={main}>
			<Preview>
				You have requested to change email of {appName}, please click the button
				below to verify.
			</Preview>
			<Container style={container}>
				<Img
					src={logoUrl}
					width="auto"
					height="50"
					alt="Papa Logo"
					style={logo}
				/>
				<Text style={paragraph}>Hi {userFirstname},</Text>
				<Text style={paragraph}>
					You have requested to change email of {appName} to {newEmail}, please
					click the button below to verify.
				</Text>
				<Text style={paragraph}>
					After verification, another verification email will be sent to{" "}
					<strong>{newEmail}</strong> as well.
				</Text>
				<Text style={{ ...paragraph, color: "#8898aa", fontSize: "14px" }}>
					If you did not request this change, please ignore this email.
				</Text>
				<Section style={btnContainer}>
					<Button style={button} href={verifyLink}>
						Verify Change
					</Button>
				</Section>
				<Text style={paragraph}>
					Best,
					<br />
					The {appName} team
				</Text>
				<Hr style={hr} />
				<Text style={footer}>Somewhere on the 🌏.</Text>
			</Container>
		</Body>
	</Html>
)

export default VerifyChangeEmail

const main = {
	backgroundColor: "#ffffff",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
	margin: "0 auto",
	padding: "20px 0 48px",
}

const logo = {
	margin: "0 auto",
}

const paragraph = {
	fontSize: "16px",
	lineHeight: "26px",
}

const btnContainer = {
	textAlign: "center" as const,
}

const button = {
	backgroundColor: "#0B1F66",
	borderRadius: "3px",
	color: "#fff",
	fontSize: "16px",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "block",
	padding: "12px",
}

const hr = {
	borderColor: "#cccccc",
	margin: "20px 0",
}

const footer = {
	color: "#8898aa",
	fontSize: "12px",
}
