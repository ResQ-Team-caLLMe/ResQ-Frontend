"use client";

import React from "react";
import {
    Box,
    Card,
    Typography,
    Grid,
    Button,
} from "@mui/material";
import LiveMap from "./LiveMap";

export default function PreviewDashboard({
    goToDashboard,
}: {
    goToDashboard: () => void;
}) {
    return (
        <Box
            sx={{
                width: { xs: "100%", sm: 380 },
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: { xs: 2, sm: 0 },
            }}
        >
            <Card
                sx={{
                    borderRadius: 4,
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    p: 2,
                }}
            >
                {/* Row 1: Live map (with built-in fallback) */}
                <Box sx={{ height: 160, borderRadius: 3, overflow: "hidden", mb: 2 }}>
                    <LiveMap />
                </Box>

                {/* Row 2: Three mini stat cards */}
                <Grid container spacing={2}>
                    {[
                        { title: "Incoming", value: 12 },
                        { title: "Emergency", value: 5 },
                        { title: "Resolved", value: 8 },
                    ].map((stat, i) => (
                        <Grid size={{ xs: 4 }} key={i}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    background: "rgba(255,255,255,0.1)",
                                    backdropFilter: "blur(10px)",
                                    textAlign: "center",
                                    py: 1,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{ color: "#ccc", fontSize: "0.75rem" }}
                                >
                                    {stat.title}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ color: "white", lineHeight: 1.2 }}
                                >
                                    {stat.value}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Card>

            {/* Button under preview */}
            <Button
                onClick={goToDashboard}
                variant="outlined"
                sx={{
                    color: "white",
                    borderRadius: 4,
                    borderColor: "gray",
                    whiteSpace: "nowrap",
                }}
            >
                View Dashboard
            </Button>
        </Box>
    );
}
