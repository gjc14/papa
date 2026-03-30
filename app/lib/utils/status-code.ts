/**
 * HTTP status codes with their corresponding texts and descriptions
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export const statusCodeMap: Record<
	number,
	{
		readonly text: string
		readonly description: string
	}
> = {
	// 1xx Informational
	100: {
		text: "Continue",
		description:
			"The server has received the request headers, and the client should proceed to send the request body.",
	},
	101: {
		text: "Switching Protocols",
		description:
			"The server is switching protocols as requested by the client.",
	},
	102: {
		text: "Processing",
		description:
			"The server has received and is processing the request, but no response is available yet.",
	},
	103: {
		text: "Early Hints",
		description: "Used to return some response headers before final HTTP text.",
	},

	// 2xx Success
	200: { text: "OK", description: "The request has succeeded." },
	201: {
		text: "Created",
		description:
			"The request has been fulfilled and has resulted in one or more new resources being created.",
	},
	202: {
		text: "Accepted",
		description:
			"The request has been accepted for processing, but the processing is not yet complete.",
	},
	203: {
		text: "Non-Authoritative Information",
		description:
			"The returned metadata is not the definitive set of metadata from the origin server.",
	},
	204: {
		text: "No Content",
		description:
			"The server successfully processed the request and is not returning any content.",
	},
	205: {
		text: "Reset Content",
		description:
			"The server successfully processed the request, but is not returning any content.",
	},
	206: {
		text: "Partial Content",
		description:
			"The server is delivering only part of the resource due to a range header sent by the client.",
	},

	// 3xx Redirection
	300: {
		text: "Multiple Choices",
		description: "The request has more than one possible response.",
	},
	301: {
		text: "Moved Permanently",
		description:
			"The requested resource has been assigned a new permanent URI.",
	},
	302: {
		text: "Found",
		description:
			"The requested resource resides temporarily under a different URI.",
	},
	303: {
		text: "See Other",
		description:
			"The response to the request can be found under a different URI.",
	},
	304: {
		text: "Not Modified",
		description: "The resource has not been modified since the last request.",
	},
	305: {
		text: "Use Proxy",
		description:
			"The requested resource is available only through a proxy, the address for which is provided in the response.",
	},
	307: {
		text: "Temporary Redirect",
		description:
			"The requested resource resides temporarily under a different URI.",
	},
	308: {
		text: "Permanent Redirect",
		description:
			"The requested resource has been assigned a new permanent URI.",
	},

	// 4xx Client Error
	400: {
		text: "Bad Request",
		description:
			"The server cannot or will not process the request due to a client error.",
	},
	401: {
		text: "Unauthorized",
		description:
			"Authentication is required and has failed or has not yet been provided.",
	},
	402: {
		text: "Payment Required",
		description: "Payment is required to access the requested resource.",
	},
	403: {
		text: "Forbidden",
		description:
			"The server understands the request but refuses to authorize it.",
	},
	404: {
		text: "Not Found",
		description: "The requested resource could not be found on the server.",
	},
	405: {
		text: "Method Not Allowed",
		description:
			"The request method is not supported for the requested resource.",
	},
	406: {
		text: "Not Acceptable",
		description:
			"The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.",
	},
	407: {
		text: "Proxy Authentication Required",
		description:
			"Proxy authentication is required to access the requested resource.",
	},
	408: {
		text: "Request Timeout",
		description: "The server timed out waiting for the request.",
	},
	409: {
		text: "Conflict",
		description:
			"The request could not be completed due to a conflict with the current state of the resource.",
	},
	410: {
		text: "Gone",
		description:
			"The requested resource is no longer available and has been permanently removed.",
	},
	411: {
		text: "Length Required",
		description:
			"The request did not specify the length of its content, which is required by the resource.",
	},
	412: {
		text: "Precondition Failed",
		description:
			"The server does not meet one of the preconditions that the requester put on the request.",
	},
	413: {
		text: "Payload Too Large",
		description:
			"The request is larger than the server is willing or able to process.",
	},
	414: {
		text: "URI Too Long",
		description: "The URI provided was too long for the server to process.",
	},
	415: {
		text: "Unsupported Media Type",
		description:
			"The request entity has a media type which the server or resource does not support.",
	},
	416: {
		text: "Range Not Satisfiable",
		description:
			"The client has asked for a portion of the file, but the server cannot supply that portion.",
	},
	417: {
		text: "Expectation Failed",
		description:
			"The server cannot meet the requirements of the Expect request-header field.",
	},
	418: {
		text: "I'm a teapot",
		description: "The server refuses the attempt to brew coffee with a teapot.",
	},
	421: {
		text: "Misdirected Request",
		description:
			"The request was directed at a server that is not able to produce a response.",
	},
	422: {
		text: "Unprocessable Entity",
		description:
			"The request was well-formed but was unable to be followed due to semantic errors.",
	},
	423: {
		text: "Locked",
		description: "The resource that is being accessed is locked.",
	},
	424: {
		text: "Failed Dependency",
		description:
			"The request failed because it depended on another request and that request failed.",
	},
	425: {
		text: "Too Early",
		description:
			"Indicates that the server is unwilling to risk processing a request that might be replayed.",
	},
	426: {
		text: "Upgrade Required",
		description: "The client should switch to a different protocol.",
	},
	428: {
		text: "Precondition Required",
		description: "The origin server requires the request to be conditional.",
	},
	429: {
		text: "Too Many Requests",
		description:
			"The user has sent too many requests in a given amount of time.",
	},
	431: {
		text: "Request Header Fields Too Large",
		description:
			"The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.",
	},
	451: {
		text: "Unavailable For Legal Reasons",
		description:
			"The server is denying access to the resource as a consequence of a legal demand.",
	},

	// 5xx Server Error
	500: {
		text: "Internal Server Error",
		description:
			"The server encountered an unexpected condition that prevented it from fulfilling the request.",
	},
	501: {
		text: "Not Implemented",
		description:
			"The server does not support the functionality required to fulfill the request.",
	},
	502: {
		text: "Bad Gateway",
		description:
			"The server, while acting as a gateway or proxy, received an invalid response from the upstream server.",
	},
	503: {
		text: "Service Unavailable",
		description:
			"The server is currently unable to handle the request due to temporary overloading or maintenance of the server.",
	},
	504: {
		text: "Gateway Timeout",
		description:
			"The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server.",
	},
	505: {
		text: "HTTP Version Not Supported",
		description:
			"The server does not support the HTTP protocol version used in the request.",
	},
	506: {
		text: "Variant Also Negotiates",
		description:
			"The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself.",
	},
	507: {
		text: "Insufficient Storage",
		description:
			"The server is unable to store the representation needed to complete the request.",
	},
	508: {
		text: "Loop Detected",
		description:
			"The server detected an infinite loop while processing the request.",
	},
	510: {
		text: "Not Extended",
		description:
			"Further extensions to the request are required for the server to fulfill it.",
	},
	511: {
		text: "Network Authentication Required",
		description: "The client needs to authenticate to gain network access.",
	},
} as const

// Utility functions for working with status codes
export const getStatusInfo = (code: number) => statusCodeMap[code]

export const isInformational = (code: number): boolean =>
	code >= 100 && code < 200
export const isSuccess = (code: number): boolean => code >= 200 && code < 300
export const isRedirection = (code: number): boolean =>
	code >= 300 && code < 400
export const isClientError = (code: number): boolean =>
	code >= 400 && code < 500
export const isServerError = (code: number): boolean =>
	code >= 500 && code < 600

export const getStatusCategory = (
	code: number,
):
	| "informational"
	| "success"
	| "redirection"
	| "client_error"
	| "server_error"
	| "unknown" => {
	if (isInformational(code)) return "informational"
	if (isSuccess(code)) return "success"
	if (isRedirection(code)) return "redirection"
	if (isClientError(code)) return "client_error"
	if (isServerError(code)) return "server_error"
	return "unknown"
}

// Type helpers
export type StatusCode = keyof typeof statusCodeMap
export type StatusInfo = (typeof statusCodeMap)[StatusCode]
export type StatusCategory = ReturnType<typeof getStatusCategory>
