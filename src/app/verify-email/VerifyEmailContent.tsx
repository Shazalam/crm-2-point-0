"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { VerifyOtpRequest, verifyOtpSchema } from "@/lib/validators/register.validator";
import { useToastHandler } from "@/lib/hooks/useToastHandler";
import InputField from "@/components/InputField";
import { clearAllErrors, clearAllSuccess, selectAuth, verifyEmail } from "../store/slices/authSlice";
import Button from "@/components/Button";

export default function VerifyEmailContent() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { verifyOtpLoading, verifyOtpError, verifyOtpSuccessMsg, user, otpExpiresIn} = useAppSelector(selectAuth);

    const [timeLeft, setTimeLeft] = React.useState(getTimeLeft(otpExpiresIn ? new Date(otpExpiresIn) : null));
    const [currentAction, setCurrentAction] = React.useState<"verify" | "resend" | null>(null);
    
    function getTimeLeft(expires: Date | null) {
        if (!expires) return 0;
        return Math.max(0, Math.floor((expires.getTime() - Date.now()) / 1000)); // in seconds
    }
    
    useEffect(() => {
        if (!otpExpiresIn) {
            setTimeLeft(0);
            return;
        }
        const target = new Date(otpExpiresIn).getTime();
        const interval = setInterval(() => {
            const secondsLeft = Math.max(0, Math.floor((target - Date.now()) / 1000));
            setTimeLeft(secondsLeft);
            if (secondsLeft <= 0) clearInterval(interval);
        }, 1000);
         
        return () => clearInterval(interval);
    }, [otpExpiresIn]);

    // Pull & decode params
    const email = useMemo(
        () => searchParams.get("email") ? decodeURIComponent(searchParams.get("email") as string) : "",
        [searchParams]
    );

    const redirect = useMemo(
        () => searchParams.get("redirect") ? decodeURIComponent(searchParams.get("redirect") as string) : "/",
        [searchParams]
    );

    // RHF with Zod
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
        setValue,
    } = useForm<VerifyOtpRequest>({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: { email, otp: "" },
        mode: "onChange",
    });

    // useToastHandler({
    //     loading: currentAction === "verify" ? verifyOtpLoading :
    //         currentAction === "resend" ? resendOtpLoading : false,
    //     success: currentAction === "verify" ? verifyOtpSuccessMsg :
    //         currentAction === "resend" ? resendOtpSuccessMsg : null,
    //     error: currentAction === "verify" ? verifyOtpError :
    //         currentAction === "resend" ? resendOtpError : null,
    //     loadingMsg: currentAction === "verify" ? "Verifying OTP..." :
    //         currentAction === "resend" ? "Resending OTP..." : "",
    //     errorMsg: currentAction === "verify"
    //         ? verifyOtpError ?? "Failed to verify."
    //         : resendOtpError ?? "Failed to resend OTP.",
    //     showToast: !!currentAction
    // });

    // useEffect(() => {
    //     if (user?.emailVerified) {
    //         // Give the toast 1200ms to show before navigating
    //         const timer = setTimeout(() => {
    //             router.push(redirect);
    //         }, 500);

    //         return () => clearTimeout(timer); // cleanup on unmount or route change
    //     }

    //     // return () => {
    //     //     dispatch(clearAllErrors());
    //     //     dispatch(clearAllSuccess());
    //     // };
    // }, [user, verifyOtpSuccessMsg, router, dispatch, redirect]);

    useEffect(() => {
        if (
            currentAction === "verify" &&
            (verifyOtpSuccessMsg || verifyOtpError)
        ) {
            const timeout = setTimeout(() => setCurrentAction(null), 1500);

            return () => clearTimeout(timeout);
        }
       
        
        dispatch(clearAllErrors());
        dispatch(clearAllSuccess(
        ));
    }, [
        currentAction,
        verifyOtpSuccessMsg,
        verifyOtpError,
        // resendOtpSuccessMsg,
        // resendOtpError,
        dispatch
    ]);


    useEffect(() => {
        // Always clear errors (redux and RHF) on unmount
        return () => {
            dispatch(clearAllErrors());
            dispatch(clearAllSuccess());
            setValue("otp", "");
        };
    }, [dispatch, setValue]);

    // Submit handler
    const onSubmit = async (data: VerifyOtpRequest) => {
        setCurrentAction("verify");
        try {
            await dispatch(verifyEmail(data)).unwrap();
            // You may redirect here or rely on the useEffect to handle it
        } catch {
            setError("otp", { message: "Invalid or expired OTP" });
        }
    };


    // Resend handler
    const handleResendOtp = async () => {
        setCurrentAction("resend");
        try {
            // const data = { email: email }
            setValue("otp", "");
            // await dispatch(resendOtp({ email })).unwrap();
        }
        catch{
            // Optional: handle local error UI if needed (usually not needed here)
        }
    };

    if (!email) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h2>
                <p className="text-gray-600 mb-4">Email parameter is missing</p>
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700">
                    Go back to registration
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6 max-w-md mx-auto">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                    <p className="text-gray-600">{`We've sent a verification code to`}</p>
                    <p className="text-gray-900 font-semibold mt-1">{email}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <InputField
                        label="Verification Code"
                        {...register("otp")}
                        error={errors?.otp?.message}
                        type="text"
                        icon={<FiMail className="w-4 h-4" />}
                        placeholder="Enter 6-digit OTP"
                        // inputSize="md"
                        maxLength={6}
                        autoComplete="one-time-code"
                        disabled={verifyOtpLoading}
                    />
                    <Button
                        type="submit"
                        loading={verifyOtpLoading}
                        variant="primary"
                        fullWidth
                        disabled={timeLeft === 0}
                    >
                        {verifyOtpLoading ? "Verifying..." : "Verify Email"}
                    </Button>
                </form>
                {timeLeft > 0 ? (
                    <div className="text-center text-sm text-gray-500 mt-2">
                        OTP expires in <span className="font-semibold text-blue-600">
                            {`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
                        </span> minutes
                    </div>
                ) : (
                    <div className="text-center text-sm text-red-600 mt-2">
                        OTP has expired. Please request a new code.
                    </div>
                )}
                <div className="text-center space-y-3">
                    {/* <button
                        onClick={handleResendOtp}
                        disabled={resendOtpLoading || timeLeft !== 0}
                        className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                        type="button"
                    >
                        {resendOtpLoading ? "Sending..." : "Resend OTP"}
                    </button> */}
                    <div className="pt-2">
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Back to registration
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
