import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from '@react-email/components'

export const MagicLinkEmail = ({ magicLink }: { magicLink: string }) => (
	<Html>
		<Head />
		<Preview>Sign in with this magic link.</Preview>
		<Body style={main}>
			<Container style={container}>
				<Heading style={heading}>🪄 Your magic link</Heading>
				<Section style={body}>
					<Text style={paragraph}>
						<Link style={link} href={magicLink}>
							👉 Click here to sign in 👈
						</Link>
					</Text>
					<Text style={paragraph}>
						If you didn't request this, please ignore this email.
					</Text>
				</Section>
				<Text style={paragraph}>
					Best, <br />- Papa Team {'<3'}
				</Text>
				<Hr style={hr} />
				<Text style={footer}>
					Build by <Link href="https://github.com/gjc14/papa">Papa</Link>
				</Text>
			</Container>
		</Body>
	</Html>
)

export default MagicLinkEmail

const main = {
	backgroundColor: '#ffffff',
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
	margin: '0 auto',
	padding: '20px 25px 48px',
	backgroundPosition: 'bottom',
	backgroundRepeat: 'no-repeat, no-repeat',
}

const heading = {
	fontSize: '28px',
	fontWeight: 'bold',
	marginTop: '48px',
}

const body = {
	margin: '24px 0',
}

const paragraph = {
	fontSize: '16px',
	lineHeight: '26px',
}

const link = {
	color: '#ffcc00',
}

const hr = {
	borderColor: '#dddddd',
	marginTop: '48px',
}

const footer = {
	color: '#8898aa',
	fontSize: '12px',
	marginLeft: '4px',
}
