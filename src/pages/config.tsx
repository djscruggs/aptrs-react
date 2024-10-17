import { useState, useEffect } from "react"
import { ReportStandard, ProjectType } from "../lib/data/definitions"
import * as api from "../lib/data/api"

export default function Config() {
    

  return (
      <div>
          <h1>Config</h1>
          <ReportStandards />
          <ProjectTypes  />
      </div>
  )
}

function ReportStandards() {
  const [reportStandards, setReportStandards] = useState<ReportStandard[]>([])
  useEffect(() => {
    api.fetchReportStandards().then(setReportStandards)
}, [])
    return (
        <div>
            <h2>Report Standards</h2>
            <ul>
                {reportStandards.map(standard => (
                    <li key={standard.id}>{standard.name}</li>
                ))}
            </ul>
        </div>
    )
}

function ProjectTypes() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])
  useEffect(() => {
    api.fetchProjectTypes().then(setProjectTypes)
}, [])
    return (
        <div>
            <h2>Project Types</h2>
            <ul>
                {projectTypes.map(type => (
                    <li key={type.id}>{type.name}</li>
                ))}
            </ul>
        </div>
    )
}

