import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  CardContent,
  Stack,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  School,
  Security,
  Speed,
  CheckCircleOutline,
  ArrowForward,
} from "@mui/icons-material";

export default function Landing() {
  const theme = useTheme();

  const handleSignIn = () => {
    // TODO: Implement Canvas OAuth redirect
    console.log("Redirecting to Canvas OAuth...");
    window.location.href = "/api/auth/canvas";
  };

  const features = [
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: "No SEB Configuration Expertise Needed",
      description: "Intuitive setup wizard guides you through the entire process",
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Automatic Security Settings",
      description: "Smart presets ensure proper exam lockdown configuration",
    },
    {
      icon: <CheckCircleOutline sx={{ fontSize: 40 }} />,
      title: "Ready-to-Distribute Exam Packages",
      description: "Generate everything students need in seconds",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        display: "flex",
        alignItems: "center",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Chip
            icon={<School />}
            label="University of Florida"
            color="primary"
            sx={{ mb: 3 }}
          />

          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            SEB Exam Creator
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, fontWeight: 400, maxWidth: "700px", mx: "auto" }}
          >
            Create secure, proctored exams for Canvas with Safe Exam Browser
            integration
          </Typography>

          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={handleSignIn}
            sx={{
              py: 2,
              px: 6,
              fontSize: "1.1rem",
              borderRadius: 2,
              textTransform: "none",
              boxShadow: theme.shadows[8],
              "&:hover": {
                boxShadow: theme.shadows[12],
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Sign in with Canvas
          </Button>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Stats Section */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: "white",
            mb: 6,
          }}
        >
          <CardContent sx={{ py: 6 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    10 min
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Average exam setup time
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    75%
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Time saved vs manual config
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    100%
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Free & open-source
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
            How It Works
          </Typography>

          <Stack spacing={3} sx={{ maxWidth: "600px", mx: "auto" }}>
            {[
              { step: 1, text: "Sign in with your Canvas credentials" },
              { step: 2, text: "Select your course and fill in exam details" },
              {
                step: 3,
                text: "Choose security preset (Standard, High Security, etc.)",
              },
              { step: 4, text: "Generate and download SEB configuration file" },
              { step: 5, text: "Distribute to students - done!" },
            ].map((item) => (
              <Box
                key={item.step}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: theme.palette.primary.main,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </Box>
                <Typography variant="body1" sx={{ textAlign: "left" }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Footer CTA */}
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to simplify your exam creation?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Get started in less than a minute
          </Typography>
          <Button
            variant="outlined"
            size="large"
            endIcon={<ArrowForward />}
            onClick={handleSignIn}
            sx={{
              py: 1.5,
              px: 5,
              fontSize: "1rem",
              borderRadius: 2,
              textTransform: "none",
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Sign in with Canvas
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
