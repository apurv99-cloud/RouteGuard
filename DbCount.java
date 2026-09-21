import java.sql.*;
public class DbCount {
  public static void main(String[] args) throws Exception {
    String url = "jdbc:h2:file:./Backend/data/routeguard;AUTO_SERVER=TRUE";
    try (Connection c = DriverManager.getConnection(url, "sa", "")) {
      DatabaseMetaData md = c.getMetaData();
      ResultSet tables = md.getTables(null, "PUBLIC", "TRIPS", new String[]{"TABLE"});
      boolean exists = tables.next();
      System.out.println("TRIPS_TABLE_EXISTS=" + exists);
      if (exists) {
        try (PreparedStatement s = c.prepareStatement("SELECT COUNT(*) FROM PUBLIC.TRIPS")) {
          ResultSet rs = s.executeQuery();
          rs.next();
          System.out.println("TRIP_COUNT=" + rs.getInt(1));
        }
      }
      try (PreparedStatement s = c.prepareStatement("SELECT COUNT(*) FROM PUBLIC.TRUCKS")) {
        ResultSet rs = s.executeQuery();
        rs.next();
        System.out.println("TRUCK_COUNT=" + rs.getInt(1));
      }
    }
  }
}
