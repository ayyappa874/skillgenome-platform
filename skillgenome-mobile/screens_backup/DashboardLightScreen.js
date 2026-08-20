import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DashboardLightScreen = ({ profile = { name: "samberapu ayyappa", title: "Aspiring Data Scientist" } }) => {
  return (
    <View style={styles.container}>
      {/* Absolute Background subtle gradient */}
      <LinearGradient 
        colors={['#F5F7FB', '#F4F5FA', '#E8EEF8']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{profile.name}.</Text>
          </View>
          
          <View style={styles.badgeWrapper}>
            <LinearGradient
              colors={['#4CB8C4', '#3CD3AD', '#89253e', '#7b4397']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badgeGradientBorder}
            >
              <LinearGradient
                colors={['#3282f6', '#9c41f7']}
                style={styles.badgeInner}
              >
                <Text style={styles.badgeText}>3</Text>
              </LinearGradient>
            </LinearGradient>
            {/* Glowing shadow behind badge */}
            <View style={styles.badgeGlow} />
          </View>
        </View>

        {/* --- DASHBOARD READY BANNER --- */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#FAFAFF']}
            style={styles.bannerCard}
          >
            <View style={styles.bannerIconWrapper}>
               <Ionicons name="sparkles" size={16} color="#7F56D9" />
            </View>
            <View style={styles.bannerTextContent}>
              <Text style={styles.bannerTitle}>Your dashboard is ready</Text>
              <Text style={styles.bannerDesc}>Review your skill score, open AI chat or interview prep, or jump into the next action.</Text>
            </View>
            <TouchableOpacity style={styles.bannerArrow}>
              <Feather name="arrow-right" size={16} color="#64748B" />
            </TouchableOpacity>
          </LinearGradient>
          {/* Subtle Banner Shadow Glow */}
          <LinearGradient 
            colors={['rgba(132, 198, 244, 0.3)', 'rgba(185, 180, 248, 0.4)', 'transparent']}
            style={styles.bannerGlowShadow}
          />
        </View>

        {/* --- MAIN GENOME SCORE CARD --- */}
        <View style={styles.genomeCardContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#FDFEFF']}
            style={styles.genomeCard}
          >
            {/* Soft decorative background orbs inside the card */}
            <View style={[styles.orb, { top: -20, right: 40, backgroundColor: 'rgba(185, 180, 248, 0.15)' }]} />
            <View style={[styles.orb, { bottom: 30, left: -20, backgroundColor: 'rgba(132, 198, 244, 0.15)' }]} />

            {/* Top Profile Header */}
            <View style={styles.genomeCardHeader}>
              <View style={styles.avatarMock}>
                 <MaterialCommunityIcons name="molecule" size={24} color="#CBD5E1" />
              </View>
              <View style={styles.genomeCardUser}>
                <Text style={styles.genomeName}>{profile.name}</Text>
                <Text style={styles.genomeTitle}>{profile.title}</Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>

            {/* Circular Gauge */}
            <View style={styles.gaugeContainer}>
              <LinearGradient
                colors={['#3282f6', '#9c41f7', '#6be0f9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gaugeOuterRing}
              >
                <View style={styles.gaugeInnerCircle}>
                  <Text style={styles.gaugeScore}>88</Text>
                  <Text style={styles.gaugeLabel}>GENOME</Text>
                </View>
              </LinearGradient>
              
              {/* Mock Ring indicator dot */}
              <View style={styles.gaugeIndicatorDot}>
                <View style={styles.gaugeIndicatorDotInner} />
              </View>
            </View>

            <View style={styles.scoreDetails}>
               <Text style={styles.scoreDetailsSubtitle}>Genome Score</Text>
               <Text style={styles.scoreDetailsTitle}>(88/100)</Text>
            </View>

          </LinearGradient>
          {/* Main Card Soft glowing shadow */}
          <LinearGradient 
            colors={['rgba(132, 198, 244, 0.4)', 'rgba(185, 180, 248, 0.5)', 'transparent']}
            style={styles.genomeCardGlowShadow}
          />
        </View>

        {/* --- GENOME CORE MODULES --- */}
        <View style={styles.modulesSection}>
          <View style={styles.sectionHeader}>
            <LinearGradient colors={['#9c41f7', '#3282f6']} style={styles.sectionIconBg} start={{x:0, y:0}} end={{x:1, y:1}}>
              <MaterialCommunityIcons name="dna" size={14} color="#FFF" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Genome Core Modules</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Sync all 4 neural dimensions to unlock your comprehensive Skill Genome Rating.
          </Text>

          <View style={styles.moduleCardsWrapper}>
            {/* Resume DNA Card */}
            <View style={styles.moduleCardContainer}>
              <View style={styles.moduleCard}>
                <View style={styles.moduleCardTop}>
                  <View style={[styles.moduleIconBox, { backgroundColor: '#E0E7FF' }]}>
                    <Feather name="file-text" size={18} color="#6366F1" />
                  </View>
                  <View style={styles.moduleActiveBadge}>
                    <View style={styles.moduleActiveDot} />
                    <Text style={styles.moduleActiveText}>Active</Text>
                  </View>
                </View>
                <Text style={styles.moduleTitle}>Resume DNA</Text>
                <Text style={styles.moduleScore}>88/100</Text>
                <Text style={styles.moduleDesc}>Skills & career DNA parsed from PDF.</Text>
                
                {/* Simulated Chart lines at bottom */}
                <View style={styles.mockChartContainer}>
                  <LinearGradient colors={['transparent', '#3b82f6', 'transparent']} start={{x:0, y:0}} end={{x:1, y:1}} style={[styles.mockLine, { bottom: 15, height: 2, transform: [{rotate: '10deg'}] }]} />
                  <LinearGradient colors={['transparent', '#3b82f6', 'transparent']} start={{x:0, y:0}} end={{x:1, y:1}} style={[styles.mockLine, { bottom: 10, height: 1, transform: [{rotate: '-5deg'}], opacity: 0.5 }]} />
                  <LinearGradient colors={['rgba(59, 130, 246, 0.15)', 'transparent']} style={styles.mockChartFill} />
                </View>
              </View>
              <LinearGradient colors={['rgba(59, 130, 246, 0.3)', 'transparent']} style={styles.moduleCardGlow} />
            </View>

            {/* GitHub Repos Card */}
            <View style={styles.moduleCardContainer}>
              <View style={styles.moduleCard}>
                <View style={styles.moduleCardTop}>
                  <View style={[styles.moduleIconBox, { backgroundColor: '#F3E8FF' }]}>
                    <Feather name="settings" size={18} color="#A855F7" />
                  </View>
                </View>
                <Text style={styles.moduleTitle}>GitHub Repos</Text>
                <Text style={styles.moduleScore}>--/100</Text>
                <Text style={styles.moduleDesc}>Repository insights & dev metrics.</Text>
                
                {/* Simulated Chart lines at bottom */}
                <View style={styles.mockChartContainer}>
                  <LinearGradient colors={['transparent', '#a855f7', 'transparent']} start={{x:0, y:0}} end={{x:1, y:1}} style={[styles.mockLine, { bottom: 15, height: 2, transform: [{rotate: '-15deg'}] }]} />
                  <LinearGradient colors={['transparent', '#a855f7', 'transparent']} start={{x:0, y:0}} end={{x:1, y:1}} style={[styles.mockLine, { bottom: 5, height: 1, transform: [{rotate: '8deg'}], opacity: 0.5 }]} />
                  <LinearGradient colors={['rgba(168, 85, 247, 0.15)', 'transparent']} style={styles.mockChartFill} />
                </View>
              </View>
              <LinearGradient colors={['rgba(168, 85, 247, 0.3)', 'transparent']} style={styles.moduleCardGlow} />
            </View>
          </View>
        </View>

      </ScrollView>

      {/* --- BOTTOM NAVIGATION BAR --- */}
      <View style={styles.bottomNavContainer}>
        <BlurView intensity={70} tint="light" style={styles.bottomNavBlur}>
          
          <TouchableOpacity style={styles.navItem}>
             <Ionicons name="home" size={24} color="#3b82f6" />
             <Text style={[styles.navLabel, { color: '#3b82f6' }]}>Home</Text>
             <View style={styles.navActiveDot} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
             <Ionicons name="chatbubble-outline" size={24} color="#94A3B8" />
             <Text style={styles.navLabel}>AI Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
             <Ionicons name="search-outline" size={24} color="#94A3B8" />
             <Text style={styles.navLabel}>Explore</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
             <Ionicons name="globe-outline" size={24} color="#94A3B8" />
             <Text style={styles.navLabel}>Community</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
             <Ionicons name="settings-outline" size={24} color="#94A3B8" />
             <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>

        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120, // space for bottom nav
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
    fontFamily: 'serif', // matching the classical font look
  },
  nameText: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  badgeWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  badgeGlow: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    bottom: -5,
    backgroundColor: '#9c41f7',
    borderRadius: 24,
    opacity: 0.4,
    zIndex: 1,
  },
  badgeGradientBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
    zIndex: 2,
  },
  badgeInner: {
    flex: 1,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Banner
  bannerContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  bannerGlowShadow: {
    position: 'absolute',
    bottom: -15,
    left: 10,
    right: 10,
    height: 30,
    borderRadius: 20,
    zIndex: 1,
  },
  bannerCard: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  bannerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerTextContent: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
    fontFamily: 'serif'
  },
  bannerDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  bannerArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main Genome Card
  genomeCardContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  genomeCardGlowShadow: {
    position: 'absolute',
    bottom: -20,
    left: 15,
    right: 15,
    height: 50,
    borderRadius: 24,
    zIndex: 1,
  },
  genomeCard: {
    borderRadius: 24,
    padding: 24,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  genomeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarMock: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  genomeCardUser: {
    flex: 1,
  },
  genomeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    fontFamily: 'serif',
  },
  genomeTitle: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },

  // Gauge
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative'
  },
  gaugeOuterRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    padding: 6, // thickness of the colorful ring
  },
  gaugeInnerCircle: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3282f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  gaugeScore: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#0EA5E9', // vibrant cyan blue
  },
  gaugeLabel: {
    fontSize: 12,
    letterSpacing: 2,
    color: '#64748B',
    fontWeight: '600',
    marginTop: -5,
  },
  gaugeIndicatorDot: {
    position: 'absolute',
    bottom: 10,
    left: '25%',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  gaugeIndicatorDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0EA5E9',
  },
  scoreDetails: {
    alignItems: 'center',
    marginTop: 20,
  },
  scoreDetailsSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  scoreDetailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    fontFamily: 'serif',
    marginTop: 4,
  },

  // Modules Section
  modulesSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    fontFamily: 'serif',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  
  // Cards
  moduleCardsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moduleCardContainer: {
    width: '48%',
    position: 'relative',
  },
  moduleCardGlow: {
    position: 'absolute',
    bottom: -10,
    left: 10,
    right: 10,
    height: 30,
    borderRadius: 16,
    zIndex: 1,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    paddingBottom: 40,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden', // for the mock chart clipping
  },
  moduleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  moduleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  moduleActiveText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  moduleScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginBottom: 8,
  },
  moduleDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  // Mock Charts (Since react-native-svg is missing)
  mockChartContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  mockLine: {
    position: 'absolute',
    left: -10,
    right: -10,
  },
  mockChartFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
  },

  // Bottom Navigation
  bottomNavContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  bottomNavBlur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Extra whitening for the blur
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  navActiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
    position: 'absolute',
    bottom: -8,
  }

});

export default DashboardLightScreen;
