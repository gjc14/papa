import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { motion } from 'framer-motion'
import { File } from 'lucide-react'
import { fade } from '~/components/motions'

export const Hero = () => {
    return (
        <section className="h-full py-20 px-6 my-12 md:px-28 lg:px-36">
            <div className="w-full h-full border border-border rounded-xl grid grid-cols-1 md:grid-cols-2">
                <motion.div
                    {...fade()}
                    className="flex items-center justify-center aspect-[5/3] md:aspect-auto"
                >
                    <svg
                        className="w-28 h-28"
                        viewBox="0 0 289 293"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                        <title>face/Calm</title>
                        <desc>Open peeps.</desc>
                        <g
                            id="face/Calm"
                            stroke="none"
                            strokeWidth="1"
                            fill="none"
                            fillRule="evenodd"
                        >
                            <path
                                d="M171.041749,240.15887 C163.675125,242.292501 155.767928,242.483273 148.258906,240.279784 C141.4481,238.280984 134.454927,233.882403 129.442325,228.062017 C124.989403,222.891504 122.105494,216.608051 122.218765,209.900917 C122.23165,209.134907 122.505549,208.495522 122.926888,207.999233 C123.380478,207.464958 124.014007,207.098085 124.692682,206.938847 C125.390651,206.775083 126.128513,206.833141 126.756813,207.118539 C127.325595,207.376901 127.812904,207.815736 128.117618,208.457126 C128.887965,209.469087 129.655321,210.466061 130.425688,211.435384 C136.619652,219.083686 142.618023,224.799426 151.931921,226.849502 C156.985367,227.962038 162.032458,227.4687 166.663343,225.771293 C171.620483,223.954301 176.101584,220.7596 179.613092,216.671419 C181.200004,214.823854 183.073535,214.069743 184.905526,214.057068 C186.981571,214.042704 189.033559,215.007378 190.57944,216.549217 C192.09898,218.064783 193.116434,220.124293 193.208649,222.278695 C193.289584,224.169532 192.672753,226.144647 191.031753,227.906756 C185.626535,233.711247 178.621333,237.963558 171.041749,240.15887 Z M170.814304,144.367155 C178.365682,148.9572 189.871664,159.660291 181.748119,171.039573 C172.185929,181.073062 158.418535,169.568982 151.634201,164.366134 C145.343449,160.333898 138.275437,170.704507 144.112,175.412823 C193.135736,211.708059 213.030606,145.567387 174.633685,138.970386 C170.406047,138.243425 168.835891,142.947174 170.814304,144.367155 Z M100.174958,124.170086 C97.7478949,122.617925 94.8928863,122.085145 91.7287079,123.524696 C89.2560287,124.649136 84.9192282,128.39769 81.9011027,133.325394 C79.8363008,136.696603 78.3721211,140.651472 78.6769434,144.770947 C78.7477349,145.727649 78.3942255,146.433054 77.8366311,146.954624 C77.3962557,147.366548 76.7601476,147.669274 76.0129997,147.763908 C75.3786744,147.844253 74.6686661,147.771772 74.0913555,147.591587 C72.9931588,147.248829 72.4119407,146.536464 72.1929489,145.954883 C70.0797393,140.342792 70.9901323,134.080043 73.3585073,128.429944 C76.5547725,120.804793 82.3592783,114.41778 86.1622145,112.358526 C92.669833,108.833475 100.346995,108.671236 106.863929,112.262379 C112.411467,115.318853 115.880218,120.253414 119.330136,125.2834 C120.06351,126.352661 120.791391,127.414081 121.543672,128.456831 C123.05132,130.546275 123.201386,132.618559 122.617532,134.395557 C121.970727,136.36415 120.32151,138.025511 118.259199,138.894957 C116.353068,139.69856 114.140756,139.811681 112.183119,138.985995 C110.529381,138.288488 109.0117,136.92878 108.051384,134.621701 C106.434021,130.736299 103.739338,126.449586 100.174958,124.170086 L100.174958,124.170086 Z M223.440775,132.814369 C221.778563,133.680468 220.478145,133.941602 218.634261,133.389159 C217.614596,133.082886 216.606823,132.495899 215.817824,131.706899 C215.035882,130.924958 214.471712,129.952552 214.252419,128.873803 C213.713072,126.211477 212.256412,123.719368 210.18061,122.094757 C208.406384,120.706172 206.16691,119.97019 203.68291,120.385402 C201.002485,120.832856 198.448729,122.551933 196.689869,124.578687 C196.102007,125.256875 195.641205,126.027105 195.177941,126.792136 C194.311333,128.22283 193.469024,129.552694 192.273843,130.603376 C191.82079,131.003129 191.138107,131.28 190.476901,131.28 C190.208169,131.28 189.935444,131.236271 189.675563,131.155276 C187.007679,128.47758 186.494623,126.446273 186.580635,124.431485 C186.670832,122.318684 187.503809,120.179493 188.849905,118.183565 C192.007516,113.501608 198.002761,109.662839 202.048399,108.79334 C207.588873,107.602708 213.091225,109.031983 217.502758,112.126467 C222.041966,115.310509 225.405508,120.254035 226.454161,125.825144 C226.706431,127.166899 226.599231,128.615171 226.088238,129.870886 C225.588922,131.097909 224.71878,132.148831 223.440775,132.814369 Z M112.394258,74.2526486 C109.069304,77.4921444 105.133931,77.9939318 101.152655,78.4402385 C98.9405594,78.6905522 97.1746454,78.8923401 95.4369094,79.2844431 C90.6605649,80.3626109 85.9393099,81.9864477 81.6319378,84.3250848 C77.1292738,86.7698547 72.2223932,89.7182412 68.6922598,93.4953513 C67.8528342,94.3941678 67.061542,95.3372855 66.2691444,96.2824677 C65.5465882,97.1443561 64.8505415,97.9741006 64.1169766,98.7741419 C63.2745284,99.6930924 62.474532,100.656215 61.6787885,101.616822 C61.1867388,102.427379 61.0895404,102.626735 60.9904523,102.834265 C60.8413425,103.146109 60.6678954,103.495099 60.4697946,103.869494 C60.1984889,104.382242 59.8807027,104.94353 59.5478797,105.452422 C58.9941378,106.382586 58.6970103,106.638799 58.44026,106.753401 C58.0142242,106.943142 57.6101892,107.036611 57.2182099,106.985995 C56.8506749,106.938536 56.5044166,106.762013 56.1624818,106.47304 C54.4554262,105.030757 53.951973,102.663788 54.003574,100.151245 C54.0818781,96.3384852 55.4881691,92.117066 56.7845563,89.5220553 C59.7989145,83.4923568 63.9794222,77.2240967 69.0062346,72.7238372 C74.7422821,67.5868727 81.0177087,63.6979271 88.2256814,61.0181785 C92.7050141,59.3522788 97.8912946,57.8231463 102.771356,58.0162973 C106.284021,58.1553272 109.63736,59.1994956 112.406688,61.8070554 C114.107217,63.4077623 114.923517,65.6846039 114.923517,67.9598329 C114.923517,70.2803828 114.075698,72.6146356 112.394258,74.2526486 Z M230.202983,103.917581 C229.991535,104.264137 229.698869,104.50296 229.373218,104.646395 C229.031839,104.796759 228.650729,104.840068 228.284999,104.778443 C227.920889,104.717091 227.574779,104.552038 227.300232,104.299793 C227.037084,104.058021 226.836702,103.737376 226.747103,103.344559 C224.539595,93.6490336 220.253164,86.4354186 211.104309,81.7836507 C206.603851,79.4952872 201.428751,78.0413484 196.529682,76.8821344 C195.106038,76.5452379 193.601743,76.3269526 192.086825,76.1057581 C187.338965,75.4125185 182.556847,74.6185951 179.461645,70.7808275 C177.596631,68.4690944 176.81391,65.5126371 177.256458,62.8088302 C177.67314,60.2630482 179.160769,57.9287462 181.865031,56.529874 C188.597516,53.048922 196.963943,56.4646469 203.762668,59.3743755 C204.266993,59.5902173 204.762058,59.8021006 205.246454,60.0065439 C211.895078,62.8129721 217.958974,66.5173942 222.943608,71.815137 C226.89868,76.0180237 230.563109,82.2312248 232.038949,88.62289 C233.266795,93.9405248 232.978088,99.3690991 230.202983,103.917581 Z"
                                id="🖍-Ink"
                                fill="currentColor"
                            ></path>
                        </g>
                    </svg>
                </motion.div>

                <article className="px-8 pb-8 md:py-16 lg:p-16 space-y-8 leading-4">
                    <motion.h2
                        {...fade()}
                        className="leading text-2xl font-bold mt-1"
                    >
                        👋 Welcome to <span className="sr-only">Papa</span>
                    </motion.h2>
                    <div className="h-fit">
                        <span className="text-5xl">🥔</span>
                    </div>

                    <motion.p {...fade()}>
                        Papa CMS includes front page and CMS admin page. To
                        start building your website, please edit _web/route.tsx
                        for front page layout, and the _web._index/route.tsx for
                        / page. You could also find some useful components in
                        /app/components. 🚀
                    </motion.p>
                    <motion.ul {...fade()} className="pl-3">
                        <li>
                            Papa is built on top of&nbsp;
                            <a
                                href="https://reactrouter.com/home"
                                aria-label="Go to React Router v7 docs"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Go to the React Router v7 docs"
                            >
                                <strong>React Router v7</strong>
                            </a>
                            .
                        </li>
                        {/* <li>
                            You could add new plugin via cli&nbsp;
                            <span className="bg-zinc-300 dark:bg-zinc-700 py-0.5 px-1 rounded">
                                papa add {'<name>.plugin'}
                            </span>
                            , and add a papa.config.ts file.
                        </li> */}
                    </motion.ul>

                    <div className="flex gap-3">
                        <a
                            href="https://papacms.vercel.app"
                            aria-label="Go to papa"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Go to the Papa website"
                        >
                            <File className="w-5 h-5" />
                        </a>
                        <a
                            href="https://github.com/gjc14/papa"
                            aria-label="Go to papa repo"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Go to the GitHub repository for Papa"
                        >
                            <GitHubLogoIcon className="w-5 h-5" />
                        </a>
                    </div>
                </article>
            </div>
        </section>
    )
}
