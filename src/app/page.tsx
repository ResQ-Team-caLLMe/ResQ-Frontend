"use client";

import { AppBar, Toolbar, Typography, Button, Container, Card, CardContent, Box, Grid, Divider } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";

export default function HomePage() {
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
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Left */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              ResQ
            </Typography>
          </Box>

          {/* Middle - centered nav */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4, flex: 1, justifyContent: "center" }}>
            <Button color="inherit">How It Works</Button>
            <Button color="inherit">Partners</Button>
            <Button color="inherit">Dashboard</Button>
            <Button color="inherit">About</Button>
          </Box>

          {/* Right */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" sx={{ borderRadius: 4 }}>Request Demo</Button>
            <Button variant="contained" color="error" sx={{ borderRadius: 4 }} startIcon={<PhoneIcon />}>CALL</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container sx={{ textAlign: "center", pt: 12 }}>
        {/* Status button */}
        <Button
          variant="outlined"
          size="small"
          sx={{
            borderRadius: 20,
            borderColor: "#34D399",
            color: "white",
            px: 2.5,
            py: 0.5,
            fontSize: "0.8rem",
            textTransform: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            mb: 2
          }}
          startIcon={
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#34D399",
                animation: "pulse 1.5s infinite",
              }}
            />
          }
        >
          LIVE—READY FOR JAKARTA 112
        </Button>

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
          Every Second Counts.
        </Typography>

        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{ mb: 2 }} // same bottom margin
        >
          AI-Powered Emergency Response.
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: "#FFFFFF", maxWidth: 650, mx: "auto", mb: 4 }} // same bottom margin
        >
          ResQ connects citizens to{" "}
          <Box component="span" sx={{ fontWeight: "bold" }}>
            firefighters, police, and medical teams
          </Box>
          . It filters prank calls, auto-classifies emergencies, tracks location, and dispatches the nearest responders.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button variant="contained" color="error" size="large" startIcon={<PhoneIcon />} sx={{ borderRadius: 4 }}>CALL</Button>
          <Button variant="outlined" size="large" sx={{ color: "white", borderColor: "gray", borderRadius: 4 }}>See How It Works</Button>
        </Box>
      </Container>

      {/* Stats */}
      <Container sx={{ pt: 8, pb: 2 }}>
        <Grid container spacing={4}>
          {[
            { label: "< 2s", desc: "AI triage latency" },
            { label: "> 70%", desc: "Prank calls filtered" },
            { label: "> 40%", desc: "Faster dispatch" }
          ].map((stat, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Card
                sx={{
                  py: 2,
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "rgba(255, 255, 255, 0.01)",
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
                }}
              >
                <CardContent sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{ color: "#FFFFFF", mb: 1 }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography sx={{ color: "#ffffffff" }}>
                    {stat.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider
        sx={{
          width: "90%",          // 80% of the container/screen
          mx: "auto",            // center horizontally
          borderColor: "rgba(255,255,255,0.2)",
          my: 6,                 // vertical spacing
        }}
      />

      {/* Partners */}
      <Container sx={{ py: 2 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
          Partnered with First Responder
        </Typography>

        <Grid container spacing={4}>
          {[
            { title: "Firefighters", icon: "🔥" },
            { title: "Police", icon: "🚓" },
            { title: "Hospitals", icon: "🏥" },
            { title: "Ambulance", icon: "🚑" },
          ].map((item, i) => (
            <Grid size={{ xs: 12, md: 3 }} key={i}>
              <Card
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "rgba(255,255,255,0.05)",
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
                radial-gradient(circle at bottom right, rgba(255,255,255,0.15), transparent 60%)
              `,
                    pointerEvents: "none",
                  },
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, position: "relative", zIndex: 1 }}>
                  <Box sx={{ fontSize: 32 }}>{item.icon}</Box>
                  <Typography variant={"h6"} color="white">{item.title}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider
        sx={{
          width: "90%",          // 80% of the container/screen
          mx: "auto",            // center horizontally
          borderColor: "rgba(255,255,255,0.2)",
          my: 6,                 // vertical spacing
        }}
      />

      {/* How It Works */}
      <Container sx={{ py: 2 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={2}>
          How It Works
        </Typography>
        <Typography variant="body1" textAlign="center" mb={4}>
          From call to dispatch in seconds.
        </Typography>

        <Grid container spacing={4}>
          {[
            { title: "AI Voice Assistant", desc: "Answers and transcribes in Bahasa & English, detects intent, and collects key details.", icon: "🗣️" },
            { title: "Instant Classification", desc: "Medical, fire, or police — plus prank-risk scoring with human review for edge cases.", icon: "⚡" },
            { title: "Smart Dispatch", desc: "Routes to nearest agency with live location; operators can override anytime.", icon: "📍" },
          ].map((item, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Card
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "rgba(255,255,255,0.05)",
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
                radial-gradient(circle at top, rgba(255,255,255,0.15), transparent 60%)
              `,
                    pointerEvents: "none",
                  },
                }}
              >
                <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 2, position: "relative", zIndex: 1 }}>
                  <Box sx={{ fontSize: 36 }}>{item.icon}</Box>
                  <Typography variant="h6" fontWeight="bold" color="white">{item.title}</Typography>
                  <Typography sx={{ color: "#9ca3af" }}>{item.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider
        sx={{
          width: "90%",          // 80% of the container/screen
          mx: "auto",            // center horizontally
          borderColor: "rgba(255,255,255,0.2)",
          my: 6,                 // vertical spacing
        }}
      />

      {/* Dashboard */}
      <Container sx={{ py: 2 }}>
        <Container sx={{ py: 8, mb: 4, borderRadius: 4, background: "linear-gradient(to right, rgba(127,29,29,0.2), rgba(29,78,216,0.2))" }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Operational Dashboard
          </Typography>
          <Typography sx={{ color: "#d1d5db", maxWidth: 600 }}>
            Real-time calls, map view, prank score, and dispatch status — designed for operators and supervisors.
          </Typography>
          {/* <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button variant="outlined" sx={{ borderRadius: 4 }}>Request Agency Demo</Button>
            <Button variant="contained" color="error" sx={{ borderRadius: 4 }} startIcon={<PhoneIcon />}>CALL</Button>
          </Box> */}
        </Container>
      </Container>

      {/* About */}
      <Container sx={{ py: 2 }}>
        <Container
          sx={{
            py: 8,
            px: 4,
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(to right, rgba(127,29,29,0.2), rgba(29,78,216,0.2))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Be Part of a Safer City
            </Typography>
            <Typography sx={{ color: "#d1d5db" }}>
              Integrate ResQ with your hotline, train operators in days, and cut dispatch delays immediately.
            </Typography>
          </Box>

          {/* Right box for the button */}
          <Box
            sx={{
              width: { xs: "100%", sm: 200 }, // responsive width
              display: "flex",
              justifyContent: "center",
              mt: { xs: 2, sm: 0 }, // add margin-top on mobile
            }}
          >
            <Button variant="outlined" sx={{ color: "white", borderRadius: 4, borderColor: "gray", whiteSpace: "nowrap" }}>
              Talk to our team
            </Button>
          </Box>
        </Container>
      </Container>

      {/* Footer */}
      <Box sx={{ mt: "auto", borderTop: "1px solid #222", py: 4, px: 4 }}>
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

      <Divider
        sx={{
          width: "90%",          // 80% of the container/screen
          mx: "auto",            // center horizontally
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />

    </Box>
  );
}
