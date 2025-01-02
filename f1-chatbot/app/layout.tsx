import "./global.css"

export const metadata = {
    title: "F1-CHATBOT",
    description: "The place to go for all F1 related questions!"
}


const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

export default RootLayout;