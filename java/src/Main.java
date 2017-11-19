import java.io.File;

public class Main {

  public static void main(String[] args) {
    Watcher watch = new Watcher(new File("C:\\Users\\Lisa Vu\\Desktop\\Untitled-1.psd"));
    watch.run();
  }
}
