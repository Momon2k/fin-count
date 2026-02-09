import * as yup from 'yup';
import { AdminProps, FormErrorsState } from '../components/types/data.types';


// Validation schema using yup
export const validationSchema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup
        .string()
        .email('Email must be valid')
        .required('Email is required'),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
});

// Validation function
export const validateForm = async (
    formData: AdminProps
): Promise<{ isValid: boolean; errors: FormErrorsState }> => {
    try {
        await validationSchema.validate(formData, { abortEarly: false });
        return { isValid: true, errors: {} };
    } catch (err) {
        const errors: FormErrorsState = {};
        if (err instanceof yup.ValidationError) {
            err.inner.forEach((error) => {
                if (error.path) {
                    errors[error.path as keyof FormErrorsState] = error.message;
                }
            });
        }
        return { isValid: false, errors };
    }
};
