"use client";

import { AppBar, Toolbar, Typography, Button, Container, Card, CardContent, Box, Grid, Divider, Table, TableHead, TableRow, TableCell, TableBody, TablePagination } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
import dynamic from "next/dynamic";

// Import charts dynamically (avoids SSR issues)
const PieChart = dynamic(() => import("../components/PieChart"), { ssr: false });
const LineChart = dynamic(() => import("../components/LineChart"), { ssr: false });
const LiveMap = dynamic(() => import("../components/LiveMap"), { ssr: false });

// Example enum values for status
const STATUS_COLORS: Record<string, string> = {
    answering: "blue",
    resolved: "green",
    filtered: "gray",
    dispatched: "#FEBC2F",
};

// Updated table data
const tableData = [
    { id: 1, time: "12:34 PM", type: "Fire", caller: "John Doe", summary: "Small fire reported", status: "answering" },
    { id: 2, time: "12:40 PM", type: "Medical", caller: "Jane Smith", summary: "Heart attack", status: "resolved" },
    { id: 3, time: "12:45 PM", type: "Police", caller: "Bob Lee", summary: "Traffic accident", status: "dispatched" },
    // add more rows...
];

export default function DashboardPage() {
    const router = useRouter();

    const goToCall = () => {
        router.push("/call");
    };

    const goToHome = () => {
        router.push("/");
    };

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const frostedCardStyle = {
        p: 2,
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "rgba(255,255,255,0.01)",
        border: "none",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: `
        radial-gradient(circle at top left, rgba(255,255,255,0.25), transparent 60%),
        radial-gradient(circle at bottom right, rgba(255,255,255,0.15), transparent 40%)
      `,
            pointerEvents: "none",
        },
        "&:hover": {
            transform: "scale(1.03)",
            transition: "transform 0.3s ease",
        },
    };

    return (
        <Box sx={{ bgcolor: "black", color: "white", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Navbar */}
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)", // semi-transparent black
                    backdropFilter: "blur(12px)",          // blur effect
                    WebkitBackdropFilter: "blur(12px)",    // Safari support
                    borderBottom: "1px solid rgba(255,255,255,0.1)", // subtle line
                    boxShadow: "none",
                }}
            >
                <Toolbar sx={{ position: "relative", minHeight: 64 }}> {/* keeps AppBar height fixed */}
                    {/* Left */}
                    <Box
                        sx={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                        }}
                        onClick={goToHome}
                    >
                        <Image
                            src="/logo_ResQ.png"
                            alt="ResQ Logo"
                            width={80}
                            height={80}
                            style={{
                                height: 80,
                                transform: "scale(1.5)", // enlarge without changing AppBar height
                                transformOrigin: "center",
                            }}
                        />
                    </Box>

                    {/* Middle - centered nav */}
                    <Box
                        sx={{
                            display: { xs: "none", md: "flex" },
                            gap: 4,
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                        }}
                    >
                        <Button color="inherit" onClick={goToHome}>Back to Home</Button>
                    </Box>

                    {/* Right */}
                    <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" sx={{ borderRadius: 4 }}>Request Demo</Button>
                        <Button
                            variant="contained"
                            color="error"
                            sx={{ borderRadius: 4 }}
                            startIcon={<PhoneIcon />}
                            onClick={goToCall}
                        >
                            CALL
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container sx={{ pt: 12, pb: 4 }}>

                <Typography
                    variant="h2"
                    fontWeight="bold"
                    sx={{
                        background: "linear-gradient(to right, red, white, blue)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 1, // set bottom margin explicitly
                    }}
                >
                    Real-Time Dashboard
                </Typography>

                {/* Row 1: Incoming & Emergency Calls */}
                <Grid container spacing={4}>
                    {/* First card: Incoming Calls */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={frostedCardStyle}>
                            <CardContent sx={{ textAlign: "left", position: "relative", zIndex: 1 }}>
                                {/* Title */}
                                <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                    Incoming Calls
                                </Typography>

                                {/* Main data */}
                                <Typography variant="h1" fontWeight="bold" sx={{ color: "#fff", mb: 1 }}>
                                    128
                                </Typography>

                                {/* Additional info */}
                                <Typography variant="body2" sx={{ color: "#cccccc" }}>
                                    Last 30 min · ~48 km² coverage
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Second card: Emergency Calls with status box */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={frostedCardStyle}>
                            <CardContent sx={{ position: "relative", zIndex: 1 }}> {/* Set desired height */}
                                <Grid container sx={{ height: "100%" }} spacing={2}>
                                    {/* Left column: 3 rows */}
                                    <Grid size={{ xs: 8 }} sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                                        <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                            Emergency Calls
                                        </Typography>

                                        <Typography variant="h1" fontWeight="bold" sx={{ color: "#fff", mb: 1 }}>
                                            32
                                        </Typography>

                                        {/* Additional info */}
                                        <Typography variant="body2" sx={{ color: "#cccccc" }}>
                                            Last 30 min · ~48 km² coverage
                                        </Typography>
                                    </Grid>

                                    {/* Right column: status box at bottom right */}
                                    <Grid size={{ xs: 4 }} sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-end" }}>
                                        <Typography variant="body2" sx={{ color: "#cccccc", mb: 1 }}>
                                            Call Filtering
                                        </Typography>
                                        <Box
                                            sx={{
                                                bgcolor: "primary.main",
                                                color: "#fff",
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 4,
                                                display: "inline-block",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Active
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Row 2: Pie & Line Charts */}
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={frostedCardStyle}>
                            <CardContent sx={{ position: "relative", zIndex: 1 }}>
                                <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                    Call Types
                                </Typography>
                                <PieChart /> {/* replace with your pie chart component */}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={frostedCardStyle}>
                            <CardContent sx={{ position: "relative", zIndex: 1 }}>
                                <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                    Emergency Calls Over Time
                                </Typography>
                                <LineChart /> {/* replace with your line chart component */}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Row 3: Live Map */}
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    <Grid size={{ xs: 12 }} sx={{ height: "600px" }}> {/* optional min height */}
                        <Card sx={{ ...frostedCardStyle, height: "100%", display: "flex", flexDirection: "column" }}>
                            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
                                <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                    Live Map Emergencies Condition
                                </Typography>
                                <Box sx={{ flex: 1 }}> {/* stretch the map */}
                                    <LiveMap />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Row 4: Table */}
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    <Grid size={{ xs: 12 }}>
                        <Card sx={frostedCardStyle}>
                            <CardContent sx={{ position: "relative", zIndex: 1 }}>
                                <Typography variant="h6" color="white" sx={{ mb: 2 }}>
                                    Recent Calls
                                </Typography>

                                <Table sx={{ color: "white" }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Time</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Type</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Caller</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Summary</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {tableData
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell sx={{ color: "white" }}>{row.time}</TableCell>
                                                    <TableCell sx={{ color: "white" }}>{row.type}</TableCell>
                                                    <TableCell sx={{ color: "white" }}>{row.caller}</TableCell>
                                                    <TableCell sx={{ color: "white" }}>{row.summary}</TableCell>
                                                    <TableCell>
                                                        <Box
                                                            sx={{
                                                                bgcolor: STATUS_COLORS[row.status] ?? "gray",
                                                                color: "white",
                                                                px: 2,
                                                                py: 0.5,
                                                                borderRadius: 4,
                                                                textAlign: "center",
                                                                fontWeight: "bold",
                                                                display: "inline-block",
                                                            }}
                                                        >
                                                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>

                                <TablePagination
                                    component="div"
                                    count={tableData.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[10, 25, 50]}
                                    sx={{
                                        color: "white",
                                        "& .MuiTablePagination-actions button": {
                                            color: "white",              // active buttons white
                                        },
                                        "& .MuiTablePagination-actions button.Mui-disabled": {
                                            color: "gray",               // disabled buttons gray
                                        },
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            <Divider
                sx={{
                    width: "90%",          // 80% of the container/screen
                    mx: "auto",            // center horizontally
                    borderColor: "rgba(255,255,255,0.2)",
                }}
            />

            {/* Footer */}
            <Container sx={{ py: 2 }}>
                <Box sx={{ mt: "auto", py: 4, px: 4 }}>
                    <Grid container spacing={4}>
                        {[
                            {
                                title: "ResQ",
                                items: ["About Us", "Careers", "Blog", "Privacy Policy"],
                            },
                            {
                                title: "Product",
                                items: ["How it Works", "Dashboard", "Partners"],
                            },
                            {
                                title: "For Agencies",
                                items: ["Request Demo", "Security", "Changelog"],
                            },
                            {
                                title: "Contact",
                                items: ["hello@resq.city", "Jakarta, Indonesia"],
                            },
                        ].map((section, i) => (
                            <Grid size={{ xs: 12, md: 3 }} key={i}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {section.title}
                                </Typography>
                                {(section.title === "ResQ" ? (
                                    <Typography variant={"body1"} sx={{ color: "white", fontWeight: "bold", mt: 0.5, pr: 8 }}>
                                        Responsive Emergency System with AI-driven Quick-response.
                                    </Typography>
                                ) :
                                    (section.items.map((item, j) => (
                                        <Typography key={j} sx={{ color: "#9ca3af", mt: 0.5 }}>
                                            {item}
                                        </Typography>
                                    ))))}
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            <Typography variant="body1" textAlign="center" my={2}>
                © 2025 ResQ. All rights reserved.
            </Typography>

        </Box >
    );
}
