import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create users
  const dev = await prisma.user.upsert({
    where: { email: 'dev@vstag.com' },
    update: {},
    create: {
      email: 'dev@vstag.com',
      name: 'Dev Engineer',
      role: 'dev',
    },
  })

  const design = await prisma.user.upsert({
    where: { email: 'design@vstag.com' },
    update: {},
    create: {
      email: 'design@vstag.com',
      name: 'Design Lead',
      role: 'design',
    },
  })

  const pm = await prisma.user.upsert({
    where: { email: 'pm@vstag.com' },
    update: {},
    create: {
      email: 'pm@vstag.com',
      name: 'Product Manager',
      role: 'pm',
    },
  })

  console.log('Created users:', { dev, design, pm })

  // Create sample PRD
  const samplePRD = await prisma.pRD.create({
    data: {
      title: 'Automated Testing Dashboard Enhancement',
      content: `# Automated Testing Dashboard Enhancement

## Overview
This PRD outlines the enhancement of our automated testing dashboard to improve visibility into test execution and failure patterns.

## Problem Statement
Engineering teams currently lack real-time visibility into test failures and trends, making it difficult to identify flaky tests and recurring issues quickly.

## Goals
1. Provide real-time test execution monitoring
2. Identify flaky tests automatically
3. Show historical trends and patterns
4. Enable quick triage of test failures

## User Stories

### As a developer, I want to:
- See test execution status in real-time
- Quickly identify which tests are failing
- Understand if a failure is new or recurring
- Get notified when my PR causes test failures

### As a QA engineer, I want to:
- Track test coverage across different environments
- Identify flaky tests that need attention
- Generate reports on test reliability
- Monitor test execution performance

## Technical Requirements

### Backend
- REST API endpoints for test results
- WebSocket support for real-time updates
- Database schema for test execution history
- Analytics service for flaky test detection

### Frontend
- Dashboard with real-time test status
- Historical trend charts
- Filtering and search capabilities
- Export functionality for reports

## Success Metrics
- Reduce time to identify failing tests by 50%
- Decrease flaky test rate by 30%
- Improve developer satisfaction scores
- Achieve 95% test result visibility

## Timeline
- Phase 1 (2 weeks): Basic dashboard and API
- Phase 2 (2 weeks): Real-time updates and analytics
- Phase 3 (1 week): Polish and deployment

## Open Questions
1. Should we integrate with existing CI/CD tools?
2. What level of historical data should we retain?
3. Do we need mobile support for the dashboard?`,
      createdBy: pm.id,
      status: 'in_review',
    },
  })

  // Create first version
  await prisma.pRDVersion.create({
    data: {
      prdId: samplePRD.id,
      version: 1,
      content: samplePRD.content,
      changedBy: pm.id,
    },
  })

  console.log('Created sample PRD:', samplePRD)

  // Create sample comments
  const comment1 = await prisma.comment.create({
    data: {
      prdId: samplePRD.id,
      userId: dev.id,
      content: 'The WebSocket requirement might be overkill. Have we considered SSE (Server-Sent Events) as a simpler alternative? It would reduce infrastructure complexity.',
      category: 'yellow',
      sectionId: 'backend',
      selectedText: 'WebSocket support for real-time updates',
    },
  })

  const comment2 = await prisma.comment.create({
    data: {
      prdId: samplePRD.id,
      userId: dev.id,
      content: 'This timeline seems very aggressive. The flaky test detection algorithm alone could take 1-2 weeks to develop and tune properly. Can we extend Phase 2?',
      category: 'red',
      sectionId: 'timeline',
      selectedText: 'Phase 2 (2 weeks): Real-time updates and analytics',
    },
  })

  await prisma.comment.create({
    data: {
      prdId: samplePRD.id,
      userId: pm.id,
      parentId: comment2.id,
      content: 'Good point. What if we move the flaky test detection to Phase 3 and focus on basic real-time updates in Phase 2? That way we can ship value faster and iterate on the analytics.',
      category: 'yellow',
    },
  })

  await prisma.comment.create({
    data: {
      prdId: samplePRD.id,
      userId: design.id,
      content: 'Can you clarify what "export functionality for reports" means? Are we talking PDF exports, CSV, or something else? This affects the UI design significantly.',
      category: 'green',
      sectionId: 'frontend',
      selectedText: 'Export functionality for reports',
    },
  })

  await prisma.comment.create({
    data: {
      prdId: samplePRD.id,
      userId: design.id,
      content: 'The success metrics look good, but how are we measuring "developer satisfaction scores"? Do we have a baseline?',
      category: 'green',
      sectionId: 'success-metrics',
    },
  })

  console.log('Created sample comments')

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
