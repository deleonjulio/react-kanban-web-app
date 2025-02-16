export const required = {
    value: true,
    message: 'Required.'
}

export const validEmail = {
    value: /\S+@\S+\.\S+/,
    message: "Invalid email address.",
}


export const emailMaxLength = {
    value: 320,
    message: "Email address cannot exceed 320 characters."
}