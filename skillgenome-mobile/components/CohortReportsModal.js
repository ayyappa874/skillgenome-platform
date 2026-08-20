import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Modal, useWindowDimensions } from 'react-native';

import { supabase } from '../utils/supabase';


import RadarChart from './RadarChart';

const CohortReportsModal = ({ visible, onClose, cohortId, T }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const S = React.useMemo(() => getStyles(T, isWide), [T, isWide]);

  const [loading, setLoading] = useState(true);
  const [cohortName, setCohortName] = useState('Cohort');
  const [skillGaps, setSkillGaps] = useState([]);
  const [insight, setInsight] = useState('');

  useEffect(() => {
    if (visible && cohortId) {
      fetchReports();
    }
  }, [visible, cohortId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cohorts')
        .select(`
          name,
          cohort_students (
            profiles ( id )
          )
        `)
        .eq('id', cohortId)
        .single();

      if (error) throw error;
      
      if (data) {
        setCohortName(data.name);
        const studentIds = [];
        if (data.cohort_students) {
          data.cohort_students.forEach(cs => {
            const p = Array.isArray(cs.profiles) ? cs.profiles[0] : cs.profiles;
            if (p) studentIds.push(p.id);
          });
        }

        if (studentIds.length > 0) {
          const [resRes, gitRes, thoughtRes, emoRes] = await Promise.all([
            supabase.from('resume_analyses').select('user_id, analysis_data').in('user_id', studentIds),
            supabase.from('github_analyses').select('user_id, analysis_data').in('user_id', studentIds),
            supabase.from('thought_analyses').select('user_id, analysis_data').in('user_id', studentIds),
            supabase.from('emotions').select('user_id, analysis_data').in('user_id', studentIds)
          ]);

          const sum = { resume: 0, github: 0, thought: 0, emotion: 0 };
          const count = { resume: 0, github: 0, thought: 0, emotion: 0 };

          if (resRes.data) resRes.data.forEach(d => { 
            const r = d.analysis_data;
            if (r) {
              const extracted = r.extractedSkills || [];
              const rScore = r.trueGenomeScore || (extracted.length > 0 ? Math.round(extracted.reduce((a, x) => a + (x.score || 0), 0) / extracted.length) : 85);
              sum.resume += rScore; count.resume++; 
            }
          });
          if (gitRes.data) gitRes.data.forEach(d => { if (d.analysis_data?.score) { sum.github += d.analysis_data.score; count.github++; }});
          if (thoughtRes.data) thoughtRes.data.forEach(d => { if (d.analysis_data?.overall_score) { sum.thought += d.analysis_data.overall_score; count.thought++; }});
          if (emoRes.data) emoRes.data.forEach(d => { if (d.analysis_data?.eq_score) { sum.emotion += d.analysis_data.eq_score; count.emotion++; }});

          const avgResume = count.resume > 0 ? Math.round(sum.resume / count.resume) : 0;
          const avgGithub = count.github > 0 ? Math.round(sum.github / count.github) : 0;
          const avgThought = count.thought > 0 ? Math.round(sum.thought / count.thought) : 0;
          const avgEmotion = count.emotion > 0 ? Math.round(sum.emotion / count.emotion) : 0;

          const gaps = [
            { skill: 'Resume / Experience', gap: Math.max(0, 90 - avgResume), avg: avgResume, target: 90 },
            { skill: 'Code Contribution', gap: Math.max(0, 85 - avgGithub), avg: avgGithub, target: 85 },
            { skill: 'Thought Process', gap: Math.max(0, 80 - avgThought), avg: avgThought, target: 80 },
            { skill: 'Emotional Intelligence', gap: Math.max(0, 85 - avgEmotion), avg: avgEmotion, target: 85 },
          ].filter(g => g.avg > 0);

          setSkillGaps(gaps);

          if (gaps.length > 0) {
            const biggestGap = [...gaps].sort((a,b) => b.gap - a.gap)[0];
            setInsight(`${biggestGap.skill} is the biggest gap in this cohort. Consider focusing your next live session on this area.`);
          } else {
            setInsight('Not enough module data yet to generate an auto-insight.');
          }
        } else {
          setSkillGaps([]);
          setInsight('No students in this cohort to analyze.');
        }
      }
    } catch (err) {
      console.warn("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={S.overlay}>
        <View style={S.modalContainer}>
          <View style={S.header}>
            <View>
              <Text style={S.title}>{cohortName} Analytics</Text>
              <Text style={S.subtitle}>Real-time aggregate performance</Text>
            </View>
            <Pressable onPress={onClose} style={S.closeBtn}>
              <Text style={S.closeBtnText}>X</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={S.loadingContainer}>
              <ActivityIndicator size="large" color={T.accent} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={S.listContainer} showsVerticalScrollIndicator={false}>
              
              <Text style={S.sectionTitle}>Aggregate Skill Gaps</Text>
              <RadarChart gaps={skillGaps} T={T} />
              
              {skillGaps.length === 0 ? (
                <View style={S.emptyContainer}>
                  <Text style={S.emptyText}>No analytics data available yet.</Text>
                </View>
              ) : (
                skillGaps.map((sg, idx) => (
                  <View key={idx} style={S.gapRow}>
                    <View style={S.gapHeader}>
                      <Text style={S.gapSkill}>{sg.skill}</Text>
                      <Text style={S.gapValue}>{sg.gap}% Gap</Text>
                    </View>
                    <View style={S.progressTrack}>
                      <View style={[S.progressFill, { width: `${sg.avg}%`, backgroundColor: T.primary }]} />
                      <View style={[S.targetMarker, { left: `${sg.target}%` }]} />
                    </View>
                    <View style={S.gapFooter}>
                      <Text style={S.gapAvg}>Avg: {sg.avg}%</Text>
                      <Text style={S.gapTarget}>Target: {sg.target}%</Text>
                    </View>
                  </View>
                ))
              )}

              <View style={[S.insightCard, { backgroundColor: `${T.primary}10`, borderColor: `${T.primary}30` }]}>
                <Text style={S.insightTitle}>💡 Auto-Insight</Text>
                <Text style={S.insightText}>{insight}</Text>
              </View>

            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (T, isWide) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: isWide ? 600 : '90%',
    maxHeight: '80%',
    backgroundColor: T.bg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.borderLow,
    overflow: 'hidden',
    padding: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: T.text,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: T.muted
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.surface,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeBtnText: {
    color: T.muted,
    fontWeight: 'bold'
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 16
  },
  emptyText: {
    color: T.muted,
    fontSize: 16
  },
  listContainer: {
    paddingBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: T.text,
    marginBottom: 16
  },
  gapRow: {
    marginBottom: 20
  },
  gapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  gapSkill: {
    fontSize: 15,
    fontWeight: '700',
    color: T.text
  },
  gapValue: {
    fontSize: 15,
    fontWeight: '800',
    color: T.text
  },
  progressTrack: {
    height: 8,
    backgroundColor: T.borderLow,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  targetMarker: {
    position: 'absolute',
    width: 2,
    height: 16,
    backgroundColor: T.text,
    top: -4
  },
  gapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  gapAvg: {
    fontSize: 12,
    color: T.muted
  },
  gapTarget: {
    fontSize: 12,
    color: T.muted
  },
  insightCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: T.primary,
    marginBottom: 8
  },
  insightText: {
    fontSize: 14,
    color: T.text,
    lineHeight: 20
  }
});

export default CohortReportsModal;
