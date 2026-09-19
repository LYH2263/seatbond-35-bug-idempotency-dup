import { useEffect, useState } from "react";
import { api } from "../api/client";

type Conflict = {
  id: number;
  showtime_id: number;
  party_size: number;
  reason: string;
  created_at: string;
};

type Replay = {
  idempotency_key: string;
  showtime_id: number;
  party_size: number;
  order_code: string;
  replay_count: number;
  created_at: string;
  last_replayed_at: string | null;
};

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [replays, setReplays] = useState<Replay[]>([]);
  useEffect(() => {
    // 两类记录分开取：冲突日志=真失败；重放=同键复用已有持座、未占新座。
    api<Conflict[]>("/conflicts").then(setConflicts);
    api<Replay[]>("/replays").then(setReplays);
  }, []);
  return (
    <>
      <h2>冲突</h2>
      <p style={{ opacity: 0.7 }}>
        左侧为真失败（同键真失败每次重试各记一条）；右侧为幂等重放——请求成功复用了已有持座、
        不占新座、不算失败。重放不会被记成又一条重叠失败。
      </p>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <section style={{ flex: "1 1 420px" }}>
          <h3 style={{ color: "#c0392b" }}>真失败 · {conflicts.length}</h3>
          <table className="table">
            <thead>
              <tr>
                <th>时间</th>
                <th>场次</th>
                <th>人数</th>
                <th>原因</th>
              </tr>
            </thead>
            <tbody>
              {conflicts.map((c) => (
                <tr key={c.id}>
                  <td className="mono">{new Date(c.created_at).toLocaleString()}</td>
                  <td>{c.showtime_id}</td>
                  <td>{c.party_size}</td>
                  <td>{c.reason}</td>
                </tr>
              ))}
              {conflicts.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ opacity: 0.6 }}>
                    暂无真失败
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
        <section style={{ flex: "1 1 420px" }}>
          <h3 style={{ color: "#1e7e4f" }}>幂等重放 · {replays.length}</h3>
          <table className="table">
            <thead>
              <tr>
                <th>最后重放</th>
                <th>场次</th>
                <th>人数</th>
                <th>复用单号</th>
                <th>次数</th>
                <th>幂等键</th>
              </tr>
            </thead>
            <tbody>
              {replays.map((r) => (
                <tr key={r.idempotency_key}>
                  <td className="mono">
                    {r.last_replayed_at ? new Date(r.last_replayed_at).toLocaleString() : "—"}
                  </td>
                  <td>{r.showtime_id}</td>
                  <td>{r.party_size}</td>
                  <td className="mono">{r.order_code}</td>
                  <td>{r.replay_count}</td>
                  <td className="mono" style={{ opacity: 0.75 }}>
                    {r.idempotency_key}
                  </td>
                </tr>
              ))}
              {replays.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ opacity: 0.6 }}>
                    暂无重放
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
