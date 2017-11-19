import java.io.File;

public class Main {

  public static void main(String[] args) {
    Watcher watch = new Watcher(new File("./Untitled.html"));
    watch.run();
  }
}
